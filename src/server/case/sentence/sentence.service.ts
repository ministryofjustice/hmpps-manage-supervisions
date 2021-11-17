import { Injectable } from '@nestjs/common'
import { Conviction, Sentence } from '../../community-api/client'
import { maxBy } from 'lodash'
import { DateTime } from 'luxon'
import { getElapsed, quantity, urlJoin } from '../../util'
import {
  ComplianceDetails,
  CompliancePeriod,
  ComplianceQuantity,
  ComplianceStatus,
  ComplianceStatusAlertLevel,
  ConvictionDetails,
  ConvictionOffence,
  ConvictionSentenceDetail,
  ConvictionSummary,
  CurrentComplianceConvictionSummary,
  PreviousConvictionSummary,
} from './sentence.types'
import {
  ConvictionRequirement,
  ConvictionRequirementType,
  ConvictionService,
  RequirementService,
} from '../../community-api'
import { getOffenceName, getSentenceName } from './util'
import { ComplianceService } from '../compliance'
import { ActivityComplianceFilter, ActivityService } from '../activity'
import { BreachService } from '../../community-api/breach'
import { BreadcrumbType, LinksService, UtmMedium } from '../../common/links'

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
    private readonly conviction: ConvictionService,
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

    const rar = await this.getRarRequirement(crn, current.convictionId, requirements)
    if (rar) {
      requirements.find(x => x.isRar).name = rar.name
    }
    return {
      previousConvictions:
        previous.length && previous.filter(x => x.convictionDate).length
          ? {
              count: previous.length,
              lastEnded: DateTime.fromISO(maxBy(previous, x => x.convictionDate)?.sentence?.terminationDate),
            }
          : null,
      previousBreaches: {
        count: breachesResult
          .map(x => x.breaches)
          .reduce((agg, x) => [...agg, ...x], [])
          .filter(x => !x.active && x.proven).length,
      },
      offence: getConvictionOffence(current),
      sentence: SentenceService.getConvictionSentence(current),
      requirements,
    }
  }

  async getCurrentConvictionSummary(crn: string): Promise<ConvictionSummary | null> {
    const { current } = await this.conviction.getConvictions(crn)
    if (!current) {
      return null
    }

    return {
      id: current.convictionId,
      sentence: SentenceService.getConvictionSentence(current),
    }
  }

  async getSentenceComplianceDetails(crn: string, from?: DateTime): Promise<ComplianceDetails> {
    const { requirements, current, previous } = await this.getConvictionsAndRequirements(crn, from)

    const [currentSummary, ...previousSummaries] = await Promise.all([
      this.compliance.getComplianceSummary(crn, current),
      ...previous.map(x => this.compliance.getComplianceSummary(crn, x)),
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

    function getAppointmentContent(
      filter: ActivityComplianceFilter,
      strings: { singular: string; plural: string; linkSingular: string; linkPlural: string },
    ): ComplianceQuantity {
      const fmt = (value: number): string =>
        (value === 1 ? strings.singular : strings.plural).replace('$', value.toString())
      const fmtLink = (value: number): string =>
        (value === 1 ? strings.linkSingular : strings.linkPlural).replace('$', value.toString())

      const quantity = appointmentCounts[filter]
      if (!quantity) {
        return { quantity, content: 'None' }
      }

      return {
        quantity,
        content: fmt(quantity),
        link: urlJoin(activityUrl, filter),
        linkContent: fmtLink(quantity),
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
              total: getAppointmentContent(ActivityComplianceFilter.Appointments, {
                singular: '$ national standard appointment',
                plural: '$ national standard appointments',
                linkSingular: '<span class="govuk-visually-hidden">View </span>$ national standard appointment',
                linkPlural: '<span class="govuk-visually-hidden">View </span>$ national standard appointments',
              }),
              complied: getAppointmentContent(ActivityComplianceFilter.CompliedAppointments, {
                singular: '$ complied',
                plural: '$ complied',
                linkSingular:
                  '<span class="govuk-visually-hidden">View </span>$ complied<span class="govuk-visually-hidden"> appointment</span>',
                linkPlural:
                  '<span class="govuk-visually-hidden">View </span>$ complied<span class="govuk-visually-hidden"> appointments</span>',
              }),
              acceptableAbsences: getAppointmentContent(ActivityComplianceFilter.AcceptableAbsenceAppointments, {
                singular: '$ acceptable absence',
                plural: '$ acceptable absences',
                linkSingular:
                  '<span class="govuk-visually-hidden">View </span>$ acceptable absence<span class="govuk-visually-hidden"> from an appointment</span>',
                linkPlural:
                  '<span class="govuk-visually-hidden">View </span>$ acceptable absences<span class="govuk-visually-hidden"> from an appointment</span>',
              }),
              failureToComply: getAppointmentContent(ActivityComplianceFilter.FailedToComplyAppointments, {
                singular: '$ unacceptable absence',
                plural: '$ unacceptable absences',
                linkSingular:
                  '<span class="govuk-visually-hidden">View </span>$ unacceptable absence<span class="govuk-visually-hidden"> from an appointment</span>',
                linkPlural:
                  '<span class="govuk-visually-hidden">View </span>$ unacceptable absences<span class="govuk-visually-hidden"> from an appointment</span>',
              }),
              withoutAnOutcome: getAppointmentContent(ActivityComplianceFilter.WithoutOutcome, {
                singular: '$ without a recorded outcome',
                plural: '$ without a recorded outcome',
                linkSingular:
                  '<span class="govuk-visually-hidden">View </span>$ <span class="govuk-visually-hidden">appointment </span>without a recorded outcome',
                linkPlural:
                  '<span class="govuk-visually-hidden">View </span>$ <span class="govuk-visually-hidden">appointments </span>without a recorded outcome',
              }),
            },
            status: getCurrentStatus(),
            requirement: current ? await this.getRarRequirement(crn, current.convictionId, requirements) : null,
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
    const { previous } = await this.conviction.getConvictions(crn)
    const links = this.links.of({ crn })
    // TODO: when PreviousConvictionSummary gets more complex (eg includes breaches) then switch to mutating the result of ComplianceService::convictionSummary
    return previous.map(c => ({
      name: getSentenceName(c.sentence),
      endDate: DateTime.fromISO(c.sentence.terminationDate),
      mainOffence: getOffenceName(c.offences.find(x => x.mainOffence)),
      link: links.url(BreadcrumbType.ExitToDelius, {
        utm: {
          medium: UtmMedium.Sentence,
          campaign: 'view-previous-conviction',
          content: { convictionId: c.convictionId },
        },
      }),
    }))
  }

  private async getConvictionsAndRequirements(
    crn: string,
    from?: DateTime,
  ): Promise<{ current?: Conviction; previous: Conviction[]; requirements: ConvictionRequirement[] }> {
    const { current, previous } = await this.conviction.getConvictions(crn, from)

    if (!current) {
      return { previous, requirements: [] }
    }

    return {
      current,
      previous,
      requirements: await this.requirements.getConvictionRequirements({ crn, convictionId: current.convictionId }),
    }
  }

  private static getConvictionSentence(conviction: Conviction): ConvictionSentenceDetail | null {
    const sentence = conviction.sentence
    if (!sentence) {
      return null
    }
    return {
      description: getSentenceName(sentence),
      convictionDate: DateTime.fromISO(conviction.convictionDate),
      startDate: DateTime.fromISO(sentence.startDate),
      endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
      elapsed: this.getElapsedOf(sentence),
      courtAppearance: conviction.courtAppearance?.courtName,
      responsibleCourt: conviction.responsibleCourt?.courtName,
      additionalSentences:
        conviction.sentence.additionalSentences?.map(x => ({
          name: x.type.description,
          length: x.length,
          value: x.amount,
          notes: x.notes,
        })) || null,
    }
  }

  private static getElapsedOf(sentence: Sentence): string | null {
    const result = getElapsed(sentence.startDate, sentence.originalLength, sentence.originalLengthUnits)
    return result && `${result.elapsed} elapsed (of ${result.length})`
  }

  private async getRarRequirement(
    crn: string,
    convictionId: number,
    requirements: ConvictionRequirement[],
  ): Promise<CurrentComplianceConvictionSummary['requirement']> {
    // there should only ever be a single RAR requirement in this set as teh requirement service aggregates them
    const rarRequirement = requirements.find(r => r.isRar)
    if (!rarRequirement) {
      return null
    }
    const totalRarCount = await this.activity.getActivityLogComplianceCount(
      crn,
      convictionId,
      ActivityComplianceFilter.RarActivity,
    )
    return {
      name: `${rarRequirement.name}, ${totalRarCount === 0 ? 'none' : totalRarCount} completed`,
      totalRarCount,
      requirementCount: rarRequirement.type === ConvictionRequirementType.Unit ? 1 : rarRequirement.requirements.length,
    }
  }
}
