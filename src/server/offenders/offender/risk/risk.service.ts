import { Injectable } from '@nestjs/common'
import { groupBy, orderBy } from 'lodash'
import { CommunityApiService } from '../../../community-api'
import {
  AssessmentNeedDtoSeverity,
  RiskDto,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RoshRiskToSelfDto,
} from '../../../assess-risks-and-needs-api/client'
import {
  CriminogenicNeed,
  FlatRiskToSelf,
  RiskRegistration,
  RiskLevel,
  RiskLevelMeta,
  RiskRegistrationDetails,
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
import { riskReferenceData } from './registration-reference-data'
import { AssessRisksAndNeedsApiService } from '../../../assess-risks-and-needs-api'

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
      return { active: [], inactive: [] }
    }

    const { ignoredRegistrationTypes } = this.config.get<RiskConfig>('risk')
    const filtered = groupBy(
      registrations.filter(x => !ignoredRegistrationTypes.includes(x.type.code)),
      x => x.active,
    )

    return {
      active:
        filtered['true']
          ?.map<RiskRegistration>(r => ({
            text: r.type.description,
            notes: r.notes,
            reviewDue: r.nextReviewDate && DateTime.fromISO(r.nextReviewDate),
            link: `risk/${r.registrationId}`,
          }))
          .sort((a, b) => a.text.localeCompare(b.text)) || [],
      inactive:
        filtered['false']
          ?.map<RiskRegistration>(r => ({
            text: r.type.description,
            notes: r.deregisteringNotes,
            removed: r.endDate && DateTime.fromISO(r.endDate),
            link: `removed-risk/${r.registrationId}`,
          }))
          .sort((a, b) => a.text.localeCompare(b.text)) || [],
    }
  }

  async getRiskRegistrationDetails(crn: string, registrationId: number): Promise<RiskRegistrationDetails> {
    const { data: registration } = await this.community.risks.getOffenderRegistrationDetailsByCrnUsingGET({
      crn,
      registrationId,
    })

    const lastReview = registration?.registrationReviews
      ?.sort((a, b) => (DateTime.fromISO(a.reviewDate) > DateTime.fromISO(b.reviewDate) ? 1 : -1))
      .find(r => r.completed == true)

    return {
      text: registration.type.description,
      notes: registration.notes,
      reviewDue: registration.nextReviewDate && DateTime.fromISO(registration.nextReviewDate),
      reviewed: lastReview ? DateTime.fromISO(lastReview.reviewDate) : null,
      reviewedBy: lastReview ? `${lastReview.reviewingOfficer.forenames} ${lastReview.reviewingOfficer.surname}` : null,
      added: DateTime.fromISO(registration.startDate),
      addedBy: `${registration.registeringOfficer.forenames} ${registration.registeringOfficer.surname}`,
      removed: registration.endDate && DateTime.fromISO(registration.endDate),
      removedBy:
        registration.deregisteringOfficer &&
        `${registration.deregisteringOfficer.forenames} ${registration.deregisteringOfficer.surname}`,
      removedNotes: registration.endDate && registration.deregisteringNotes,
      typeInfo: riskReferenceData[registration.type.code],
      link: `${registration.active ? 'risk' : 'removed-risk'}/${registration.registrationId}`,
    }
  }

  async getNeeds(crn: string): Promise<CriminogenicNeed[]> {
    const needs = await SanitisedAxiosError.catchNotFound(() =>
      this.assessRisksAndNeeds.needs.getCriminogenicNeedsByCrn({ crn }),
    )

    if (!needs) {
      return []
    }

    const date = DateTime.fromISO(needs.assessedOn)
    return orderBy(
      needs.identifiedNeeds
        .filter(x => x.severity !== AssessmentNeedDtoSeverity.NoNeed)
        .map(x => ({
          name: x.name,
          date,
        })),
      x => x.name,
    )
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
