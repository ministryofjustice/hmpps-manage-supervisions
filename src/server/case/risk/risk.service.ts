import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { groupBy, orderBy } from 'lodash'
import { CommunityApiService } from '../../community-api'
import {
  AssessmentNeedDtoSeverity,
  RiskDto,
  RiskDtoCurrent,
  RiskDtoPrevious,
  RoshRiskToSelfDtoAllRisksView,
} from '../../assess-risks-and-needs-api/client'
import {
  AssessRisksAndNeedsApiStatus,
  CriminogenicNeeds,
  FlatRiskToSelf,
  RiskLevel,
  RiskLevelMeta,
  RiskRegistration,
  RiskRegistrationDetails,
  RiskRegistrations,
  Risks,
  RisksAndNeedsDegraded,
  RoshRisk,
} from './risk.types'
import { ConfigService } from '@nestjs/config'
import { Config, RiskConfig } from '../../config'
import { toList } from '../../util'
import { SanitisedAxiosError } from '../../common/rest'
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../util/govuk-ui'
import { riskReferenceData } from './registration-reference-data'
import { AssessRisksAndNeedsApiService } from '../../assess-risks-and-needs-api'
import { Registration } from '../../community-api/client'
import { BreadcrumbType, LinksHelper, LinksService, ResolveBreadcrumbOptions, UtmMedium } from '../../common/links'
import { AxiosPromise } from 'axios'

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name)

  constructor(
    private readonly community: CommunityApiService,
    private readonly assessRisksAndNeeds: AssessRisksAndNeedsApiService,
    private readonly config: ConfigService<Config>,
    private readonly links: LinksService,
  ) {}

  async getRisks(crn: string): Promise<Risks | RisksAndNeedsDegraded> {
    return await this.catchDegradedState(
      crn,
      api => api.risk.getRoshRisksByCrn({ crn }),
      risks => {
        const { riskToSelf, summary, assessedOn } = risks

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
          status: AssessRisksAndNeedsApiStatus.Available,
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
            harm: flattenRisks({ suicide: 'suicide', selfHarm: 'self-harm' }, riskToSelf),
            custody: flattenRisks({ custody: 'in custody', hostelSetting: 'in a hostel' }, riskToSelf, 'about coping'),
            vulnerability: flattenRisks({ vulnerability: 'a vulnerability' }, riskToSelf),
          },
          assessedOn: assessedOn ? DateTime.fromISO(assessedOn) : null,
        }
      },
    )
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

    const links = this.links.of({ crn })
    return {
      active:
        filtered['true']
          ?.map<RiskRegistration>(r => ({
            text: r.type.description,
            notes: r.notes,
            reviewDue: r.nextReviewDate && DateTime.fromISO(r.nextReviewDate),
            links: { view: RiskService.getRegistrationUrl(links, r) },
          }))
          .sort((a, b) => a.text.localeCompare(b.text)) || [],
      inactive:
        filtered['false']
          ?.map<RiskRegistration>(r => ({
            text: r.type.description,
            notes: r.deregisteringNotes,
            removed: r.endDate && DateTime.fromISO(r.endDate),
            links: { view: RiskService.getRegistrationUrl(links, r) },
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

    const links = this.links.of({ crn })
    function exitToDelius(campaign: string) {
      return links.url(BreadcrumbType.ExitToDelius, {
        utm: { medium: UtmMedium.Risk, campaign, content: { registrationId: registration.registrationId } },
      })
    }

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
      links: {
        view: RiskService.getRegistrationUrl(links, registration),
        addReview: exitToDelius('add-risk-flag-review'),
        delete: exitToDelius('delete-risk-flag'),
        updateNotes: exitToDelius('update-risk-flag-notes'),
        viewLastReview: exitToDelius('view-risk-flag-review'),
      },
    }
  }

  async getNeeds(crn: string): Promise<CriminogenicNeeds | RisksAndNeedsDegraded> {
    return this.catchDegradedState(
      crn,
      api => api.needs.getCriminogenicNeedsByCrn({ crn }),
      needs => {
        const date = DateTime.fromISO(needs.assessedOn)
        return {
          status: AssessRisksAndNeedsApiStatus.Available,
          needs: orderBy(
            needs.identifiedNeeds
              .filter(x => x.severity !== AssessmentNeedDtoSeverity.NoNeed)
              .map(x => ({
                name: x.name,
                date,
              })),
            x => x.name,
          ),
        }
      },
    )
  }

  private static getRegistrationUrl(links: LinksHelper, registration: Registration) {
    const options: ResolveBreadcrumbOptions = { id: registration.registrationId }
    return registration.active
      ? links.url(BreadcrumbType.RiskDetails, options)
      : links.url(BreadcrumbType.RemovedRiskDetails, options)
  }

  private async catchDegradedState<T, R>(
    crn: string,
    action: (api: AssessRisksAndNeedsApiService) => AxiosPromise<T>,
    mapResult: (data: T) => R,
  ): Promise<R | RisksAndNeedsDegraded> {
    const { data, success, status } = await SanitisedAxiosError.catchStatus(
      () => action(this.assessRisksAndNeeds),
      HttpStatus.NOT_FOUND,
      ...SanitisedAxiosError.SERVICE_UNAVAILABLE_STATUSES,
    )

    if (!success) {
      if (status === HttpStatus.NOT_FOUND) {
        this.logger.log(`offender with crn '${crn}' has no risk assessment available`)
        return { status: AssessRisksAndNeedsApiStatus.NoRiskAssessment }
      }
      this.logger.error(`risks and needs service is unavailable`, { status })
      return { status: AssessRisksAndNeedsApiStatus.Unavailable }
    }

    return mapResult(data)
  }
}

function getSummaryRisks(riskToSelf: RoshRiskToSelfDtoAllRisksView): { current: string[]; previous: string[] } {
  if (!riskToSelf) {
    return { current: [], previous: [] }
  }
  const formatConcern = concern =>
    ({
      suicide: 'suicide',
      selfHarm: 'self-harm',
      custody: 'coping in custody',
      hostelSetting: 'coping in a hostel setting',
      vulnerability: 'a vulnerability',
    }[concern])
  const concerns = Object.keys(riskToSelf)
  const current = concerns.filter(key => riskToSelf[key].current === RiskDtoCurrent.Yes)
  const previous = concerns
    .filter(key => riskToSelf[key].previous === RiskDtoPrevious.Yes)
    .filter(concern => current.indexOf(concern) === -1)
  return {
    current: current.map(formatConcern),
    previous: previous.map(formatConcern),
  }
}

function flattenRisks(
  meta: Partial<Record<keyof RoshRiskToSelfDtoAllRisksView, string>>,
  riskToSelf: RoshRiskToSelfDtoAllRisksView,
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
      if (result.notes.current && risk.currentConcernsText) result.notes.current += '\n\n' + risk.currentConcernsText
      else result.notes.current = risk.currentConcernsText
    }

    if (risk.previous === RiskDtoPrevious.Yes) {
      previousConcerns.push(name)
      if (result.notes.previous && risk.previousConcernsText)
        result.notes.previous += '\n\n' + risk.previousConcernsText
      else result.notes.previous = risk.previousConcernsText
    }
  }

  if (currentConcerns.length === 0 && previousConcerns.length === 0) {
    result.value = null
  } else if (previousConcerns.length === 0 || currentConcerns.length === Object.keys(meta).length) {
    // no previous or all current then ignore previous
    result.value = `Immediate concerns ${about} ${toList(currentConcerns)}`
  } else if (currentConcerns.length === 0) {
    // no current, just previous
    result.value = `Previous concerns ${about} ${toList(previousConcerns)}`
  } else {
    // current & previous
    result.value = `Immediate concerns ${about} ${toList(currentConcerns)} and previous concerns ${about} ${toList(
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
