import { Injectable } from '@nestjs/common'
import { Conviction, Sentence } from '../../community-api/client'
import { maxBy } from 'lodash'
import { DateTime } from 'luxon'
import { getElapsed, quantity, QuantityOptions, urlJoin } from '../../util'
import {
  ComplianceDetails,
  CompliancePeriod,
  ComplianceQuantity,
  ComplianceStatus,
  ComplianceStatusAlertLevel,
  ConvictionDetails,
  ConvictionOffence,
  ConvictionRequirement,
  PreviousConvictionSummary,
} from './sentence.types'
import { RequirementService } from './requirement.service'
import { CommunityApiService } from '../../community-api'
import { getOffenceName, getSentenceName } from './util'
import { ComplianceService } from '../compliance'
import { ActivityComplianceFilter, ActivityService } from '../activity'
import { BreachService } from '../../community-api/breach'
import { BreadcrumbType, LinksService } from '../../common/links'

function getConvictionOffence(conviction: Conviction): ConvictionOffence | null {
  const mainOffence = conviction.offences.find(x => x.mainOffence)
  if (!mainOffence) {
    return null
  }

  return {
    id: mainOffence.offenceId,
    description: getOffenceName(mainOffence),
    category: mainOffence.detail.mainCategoryDescription,
    date: DateTime.fromISO(mainOffence.offenceDate),
    code: mainOffence.detail.code,
    additionalOffences: conviction.offences
      .filter(x => !x.mainOffence)
      .map(x => ({
        code: x.detail.code,
        name: getOffenceName(x),
        category: x.detail.mainCategoryDescription,
        date: DateTime.fromISO(x.offenceDate),
      })),
  }
}

@Injectable()
export class SentenceService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly requirements: RequirementService,
    private readonly compliance: ComplianceService,
    private readonly activity: ActivityService,
    private readonly breach: BreachService,
    private readonly links: LinksService,
  ) {}

  async getOffenceDetails(crn: string): Promise<ConvictionOffence | null> {
    const { current } = await this.getConvictionsAndRequirements(crn)
    if (!current) {
      return null
    }

    return getConvictionOffence(current)
  }

  async getConvictionDetails(crn: string): Promise<ConvictionDetails | null> {
    const { requirements, current, previous } = await this.getConvictionsAndRequirements(crn)

    const breachesResult = await Promise.all(previous.map(x => this.breach.getBreaches(crn, x.convictionId)))

    if (!current) {
      return null
    }

    const sentence = current.sentence

    return {
      previousConvictions: previous.length
        ? {
            count: previous.length,
            lastEnded: DateTime.fromISO(maxBy(previous, x => x.convictionDate).convictionDate),
          }
        : null,
      previousBreaches: {
        count: breachesResult
          .map(x => x.breaches)
          .reduce((agg, x) => [...agg, ...x], [])
          .filter(x => !x.active && x.proven).length,
      },
      offence: getConvictionOffence(current),
      sentence: sentence
        ? {
            description: getSentenceName(sentence),
            convictionDate: DateTime.fromISO(current.convictionDate),
            startDate: DateTime.fromISO(sentence.startDate),
            endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
            elapsed: SentenceService.getElapsedOf(sentence),
            courtAppearance: current.courtAppearance?.courtName,
            responsibleCourt: current.responsibleCourt?.courtName,
            additionalSentences:
              current.sentence.additionalSentences?.map(x => ({
                name: x.type.description,
                length: x.length,
                value: x.amount,
                notes: x.notes,
              })) || null,
          }
        : null,
      requirements,
    }
  }

  async getConvictionId(crn: string): Promise<number> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    return SentenceService.getLatestConviction(convictions)?.convictionId
  }

  async getSentenceComplianceDetails(crn: string): Promise<ComplianceDetails> {
    const from = DateTime.now().minus({ years: 2 }).set({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
    const { requirements, current, previous } = await this.getConvictionsAndRequirements(crn, from)

    const [currentSummary, ...previousSummaries] = await Promise.all([
      this.compliance.convictionSummary(crn, current),
      ...previous.map(x => this.compliance.convictionSummary(crn, x)),
    ])

    let compliancePeriod = CompliancePeriod.Last12Months
    const appointmentCounts = {
      [ActivityComplianceFilter.Appointments]: 0,
      [ActivityComplianceFilter.CompliedAppointments]: 0,
      [ActivityComplianceFilter.FailedToComplyAppointments]: 0,
      [ActivityComplianceFilter.AcceptableAbsenceAppointments]: 0,
      [ActivityComplianceFilter.WithoutOutcome]: 0,
    }
    if (currentSummary) {
      if (currentSummary.lastRecentBreachEnd) {
        compliancePeriod = CompliancePeriod.SinceLastBreach
      }

      await Promise.all(
        Object.keys(appointmentCounts).map(async (filter: ActivityComplianceFilter) => {
          appointmentCounts[filter] = await this.activity.getActivityLogComplianceCount(
            crn,
            current.convictionId,
            filter,
            currentSummary.lastRecentBreachEnd,
          )
        }),
      )
    }

    const activityUrl = this.links.getUrl(BreadcrumbType.CaseActivityLog, { crn })
    function getAppointmentQuantity(
      filter: ActivityComplianceFilter,
      name: string,
      options: QuantityOptions = {},
    ): ComplianceQuantity {
      const value = appointmentCounts[filter]
      if (value === 0) {
        return { name: 'None', value }
      }
      return {
        name: quantity(value, name, options),
        value,
        link: urlJoin(activityUrl, filter),
      }
    }

    function getCurrentStatus(): ComplianceDetails['current']['status'] {
      const value = currentSummary.inBreach
        ? ComplianceStatus.InBreach
        : appointmentCounts[ActivityComplianceFilter.FailedToComplyAppointments] >=
          current.sentence.failureToComplyLimit
        ? ComplianceStatus.PendingBreach
        : appointmentCounts[ActivityComplianceFilter.FailedToComplyAppointments] > 0
        ? ComplianceStatus.FailureToComply
        : compliancePeriod === CompliancePeriod.SinceLastBreach
        ? ComplianceStatus.PreviousBreach
        : ComplianceStatus.Clean
      let alertLevel: ComplianceStatusAlertLevel
      switch (value) {
        case ComplianceStatus.InBreach:
        case ComplianceStatus.PendingBreach:
          alertLevel = ComplianceStatusAlertLevel.Danger
          break
        case ComplianceStatus.FailureToComply:
        case ComplianceStatus.PreviousBreach:
          alertLevel = ComplianceStatusAlertLevel.Warning
          break
        default:
          alertLevel = ComplianceStatusAlertLevel.Success
          break
      }
      return {
        value,
        alertLevel,
        description:
          value === ComplianceStatus.InBreach
            ? 'Breach in progress'
            : `${quantity(appointmentCounts[ActivityComplianceFilter.FailedToComplyAppointments], 'failure', {
                zero: 'No',
              })} to comply ${compliancePeriod}`,
        breachSuggested: value === ComplianceStatus.PendingBreach && !currentSummary.inBreach,
      }
    }

    return {
      current: currentSummary
        ? {
            ...currentSummary,
            period: compliancePeriod,
            appointments: {
              total: getAppointmentQuantity(ActivityComplianceFilter.Appointments, 'national standard appointment'),
              complied: getAppointmentQuantity(ActivityComplianceFilter.CompliedAppointments, 'complied', {
                plural: '',
                zero: 'None',
              }),
              acceptableAbsences: getAppointmentQuantity(
                ActivityComplianceFilter.AcceptableAbsenceAppointments,
                'acceptable absence',
              ),
              failureToComply: getAppointmentQuantity(
                ActivityComplianceFilter.FailedToComplyAppointments,
                'unacceptable absence',
              ),
              withoutAnOutcome: getAppointmentQuantity(
                ActivityComplianceFilter.WithoutOutcome,
                'without a recorded outcome',
                {
                  plural: '',
                },
              ),
            },
            status: getCurrentStatus(),
            requirement: requirements.find(r => r.isRar)?.name,
          }
        : null,
      previous: {
        convictions: previousSummaries.filter(x => x),
        dateFrom: from,
        totalBreaches: previousSummaries.reduce((agg, x) => agg + x.previousBreaches.length, 0),
      },
    }
  }

  async getPreviousConvictions(crn: string): Promise<PreviousConvictionSummary[]> {
    const { previous } = await this.getConvictions(crn)
    // TODO: when PreviousConvictionSummary gets more complex (eg includes breaches) then switch to mutating the result of ComplianceService::convictionSummary
    return previous.map(c => ({
      name: getSentenceName(c.sentence),
      endDate: DateTime.fromISO(c.sentence.terminationDate),
      mainOffence: getOffenceName(c.offences.find(x => x.mainOffence)),
    }))
  }

  private static getLatestConviction(convictions: Conviction[]): Conviction {
    // TODO we are assuming only a single active conviction per offender at this time
    // TODO so in the case where we have multiple then just take the latest
    return maxBy(
      convictions.filter(x => x.active),
      x => x.convictionDate,
    )
  }

  private async getConvictions(
    crn: string,
    from?: DateTime,
  ): Promise<{ current?: Conviction; previous: Conviction[] }> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    const current = SentenceService.getLatestConviction(convictions)
    const previous = convictions.filter(
      c =>
        !c.active && (!from || (c.sentence?.terminationDate && DateTime.fromISO(c.sentence.terminationDate) >= from)),
    )

    return { current, previous }
  }

  private async getConvictionsAndRequirements(
    crn: string,
    from?: DateTime,
  ): Promise<{ current?: Conviction; previous: Conviction[]; requirements: ConvictionRequirement[] }> {
    const { current, previous } = await this.getConvictions(crn, from)

    if (!current) {
      return { previous, requirements: [] }
    }

    const requirements = await this.requirements.getConvictionRequirements({
      crn,
      convictionId: current.convictionId,
    })

    return { current, previous, requirements }
  }

  private static getElapsedOf(sentence: Sentence): string | null {
    const result = getElapsed(sentence.startDate, sentence.originalLength, sentence.originalLengthUnits)
    return result && `${result.elapsed} elapsed (of ${result.length})`
  }
}
