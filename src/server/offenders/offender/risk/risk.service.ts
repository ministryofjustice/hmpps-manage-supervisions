import { Injectable } from '@nestjs/common'
import { groupBy, orderBy } from 'lodash'
import { CommunityApiService } from '../../../community-api'
import {
  AssessRisksAndNeedsApiService,
  RiskDto,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RoshRiskToSelfDto,
} from '../../../assess-risks-and-needs-api'
import {
  FlatRiskToSelf,
  RegistrationFlag,
  RiskLevel,
  RiskLevelMeta,
  RiskRegistrations,
  Risks,
  RoshRisk,
} from './risk.types'
import { ConfigService } from '@nestjs/config'
import { Config, RiskConfig } from '../../../config'
import { toList } from '../../../util'
import { SanitisedAxiosError } from '../../../common/rest'
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

@Injectable()
export class RiskService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly assessRisksAndNeeds: AssessRisksAndNeedsApiService,
    private readonly config: ConfigService<Config>,
  ) {}

  async getRisks(crn: string): Promise<Risks | null> {
    const risks = await SanitisedAxiosError.catchNotFound(() =>
      this.assessRisksAndNeeds.risk.getRoshRisksByCrn({ crn }),
    )

    if (!risks) {
      return null
    }

    const { riskToSelf, summary } = risks

    const communityRisks: RoshRisk[] = orderBy(
      Object.entries(summary?.riskInCommunity || {})
        .map(([key, values]) =>
          values.map(riskTo => ({ meta: KNOWN_RISK_LEVELS[key as RiskLevel], level: key as RiskLevel, riskTo })),
        )
        .reduce((agg, x) => [...agg, ...x], []),
      [x => x.meta.index, x => x.riskTo],
      ['desc', 'asc'],
    )

    return {
      community: {
        level: communityRisks.length > 0 ? communityRisks[0].meta : null, // the highest risk is first
        risks: communityRisks,
        riskLevels: summary?.riskInCommunity || {},
        riskImminence: summary?.riskImminence,
        whoIsAtRisk: summary?.whoIsAtRisk,
        natureOfRisk: summary?.natureOfRisk,
      },
      self: {
        ...getSummaryRisks(riskToSelf),
        harm: flattenRisks({ selfHarm: 'self-harm', suicide: 'suicide' }, riskToSelf),
        custody: flattenRisks({ hostelSetting: 'in a hostel', custody: 'in custody' }, riskToSelf, 'about coping'),
        vulnerability: flattenRisks({ vulnerability: 'a vulnerability' }, riskToSelf),
      },
    }
  }

  async getRiskRegistrations(crn: string): Promise<RiskRegistrations> {
    const {
      data: { registrations },
    } = await this.community.risks.getOffenderRegistrationsByCrnUsingGET({ crn })

    if (!registrations || registrations.length === 0) {
      return { active: [], inactive: 0 }
    }

    const { ignoredRegistrationTypes } = this.config.get<RiskConfig>('risk')
    const filtered = groupBy(
      registrations.filter(x => !ignoredRegistrationTypes.includes(x.type.code)),
      x => x.active,
    )

    return {
      active:
        filtered['true']
          ?.map<RegistrationFlag>(r => ({
            text: r.type.description,
            notes: r.notes,
            reviewDue: r.nextReviewDate && DateTime.fromISO(r.nextReviewDate),
            link: '#TODO',
          }))
          .sort((a, b) => a.text.localeCompare(b.text)) || [],
      inactive: filtered['false']?.length || 0,
    }
  }
}

function getSummaryRisks(riskToSelf: RoshRiskToSelfDto): { current: boolean; previous: boolean } {
  return Object.values(riskToSelf || {})
    .filter(x => x)
    .map(({ current, previous }) => ({
      current: current === RiskDtoCurrent.Yes,
      previous: previous === RiskDtoPrevious.Yes,
    }))
    .reduce(
      (x, y) => ({
        current: x.current || y.current,
        previous: x.previous || y.previous,
      }),
      { current: false, previous: false },
    )
}

function flattenRisks(
  meta: Partial<Record<keyof RoshRiskToSelfDto, string>>,
  riskToSelf: RoshRiskToSelfDto,
  about = 'about',
): FlatRiskToSelf {
  if (!riskToSelf) {
    return {
      value: null,
      notes: { current: null, previous: null },
    }
  }

  const result: FlatRiskToSelf = { value: null, notes: { current: null, previous: null } }
  const currentConcerns: string[] = []
  const previousConcerns: string[] = []
  for (const [key, name] of Object.entries(meta)) {
    const risk: RiskDto = riskToSelf[key]
    if (!risk) {
      continue
    }

    if (risk.current === RiskDtoCurrent.Yes) {
      currentConcerns.push(name)
      result.notes.current = risk.currentConcernsText
    }

    if (risk.previous === RiskDtoPrevious.Yes) {
      previousConcerns.push(name)
      result.notes.previous = risk.previousConcernsText
    }
  }

  if (currentConcerns.length === 0 && previousConcerns.length === 0) {
    result.value = null
  } else if (previousConcerns.length === 0 || currentConcerns.length === Object.keys(meta).length) {
    // no previous or all current then ignore previous
    result.value = `There are concerns ${about} ${toList(currentConcerns)}`
  } else if (currentConcerns.length === 0) {
    // no current, just previous
    result.value = `There were concerns ${about} ${toList(previousConcerns)}`
  } else {
    // current & previous
    result.value = `There are concerns ${about} ${toList(currentConcerns)} and previous concerns ${about} ${toList(
      previousConcerns,
    )}`
  }

  return result
}

const KNOWN_RISK_LEVELS: Record<RiskLevel, RiskLevelMeta> = Object.freeze({
  LOW: { colour: GovUkUiTagColour.Green, text: 'Low', index: 0 },
  MEDIUM: { colour: GovUkUiTagColour.Yellow, text: 'Medium', index: 1 },
  HIGH: { colour: GovUkUiTagColour.Red, text: 'High', index: 2 },
  VERY_HIGH: { colour: GovUkUiTagColour.DarkRed, text: 'Very high', index: 3 },
})
