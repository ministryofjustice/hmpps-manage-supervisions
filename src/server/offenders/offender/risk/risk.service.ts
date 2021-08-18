import { Injectable } from '@nestjs/common'
import { orderBy } from 'lodash'
import { CommunityApiService } from '../../../community-api'
import {
  AssessRisksAndNeedsApiService,
  RiskDto,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RoshRiskToSelfDto,
} from '../../../assess-risks-and-needs-api'
import { FlatRiskToSelf, Level, RegistrationFlag, Risks } from './risk.types'
import { ConfigService } from '@nestjs/config'
import { Config, RiskConfig } from '../../../config'
import { toList } from '../../../util'
import { SanitisedAxiosError } from '../../../common/rest'

@Injectable()
export class RiskService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly assessRisksAndNeeds: AssessRisksAndNeedsApiService,
    private readonly config: ConfigService<Config>,
  ) {}

  async getRisks(crn: string): Promise<Risks> {
    const risks = await SanitisedAxiosError.catchNotFound(() =>
      this.assessRisksAndNeeds.risk.getRoshRisksByCrn({ crn }),
    )

    if (!risks) {
      return {}
    }

    const { riskToSelf, summary: { riskInCommunity } = {} } = risks

    const communityRisks = orderBy(
      Object.entries(riskInCommunity || {})
        .map(([key, values]) => values.map(riskTo => ({ level: KNOWN_RISK_LEVELS[key], riskTo })))
        .reduce((agg, x) => [...agg, ...x], []),
      ['level.index', 'riskTo'],
      ['desc', 'asc'],
    )

    return {
      community:
        communityRisks.length > 0
          ? {
              level: communityRisks[0].level, // the highest risk is first
              risks: communityRisks,
            }
          : null,
      self: {
        harm: flattenRisks({ selfHarm: 'self-harm', suicide: 'suicide' }, riskToSelf),
        custody: flattenRisks({ hostelSetting: 'in a hostel', custody: 'in custody' }, riskToSelf, 'about coping'),
        vulnerability: flattenRisks({ vulnerability: 'a vulnerability' }, riskToSelf),
      },
    }
  }

  async getRiskRegistrations(crn: string): Promise<RegistrationFlag[]> {
    const {
      data: { registrations },
    } = await this.community.risks.getOffenderRegistrationsByCrnUsingGET({ crn, activeOnly: true })

    if (!registrations) {
      return []
    }

    const { ignoredRegistrationTypes } = this.config.get<RiskConfig>('risk')
    return registrations
      .filter(x => !ignoredRegistrationTypes.includes(x.type.code))
      .map(r => {
        return {
          text: r.type.description,
          class: `govuk-tag--${mapDeliusRegistrationColour(r.riskColour)}`,
        }
      })
      .sort((a, b) => a.text.localeCompare(b.text))
  }
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

function mapDeliusRegistrationColour(deliusColour: string): string {
  switch (deliusColour.toLowerCase()) {
    case 'red':
      return 'red'
    case 'amber':
      return 'orange'
    case 'green':
      return 'green'
    case 'white':
      return 'grey'
    default:
      return 'grey'
  }
}

const KNOWN_RISK_LEVELS: Record<string, Level> = Object.freeze({
  LOW: { class: 'govuk-tag--green', text: 'LOW', index: 0 },
  MEDIUM: { class: 'govuk-tag--yellow', text: 'MEDIUM', index: 1 },
  HIGH: { class: 'govuk-tag--red', text: 'HIGH', index: 2 },
  VERY_HIGH: { class: 'app-tag--dark-red', text: 'VERY HIGH', index: 3 },
})
