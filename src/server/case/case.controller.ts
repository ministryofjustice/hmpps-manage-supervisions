import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import { CaseOverviewViewModel, CasePage } from './case.types'
import { RedirectResponse } from '../common/dynamic-routing'
import { OffenderService } from './offender'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { RiskService } from './risk'
import { PersonalService } from './personal'
import { BreadcrumbType, LinksService } from '../common/links'
import { CaseTabbedPage } from './case-tabbed-page.decorators'
import { ActivityService, ActivityComplianceFilter } from './activity'
import { DateTime } from 'luxon'

@Controller('case/:crn(\\w+)')
export class CaseController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly scheduleService: ScheduleService,
    private readonly sentenceService: SentenceService,
    private readonly riskService: RiskService,
    private readonly personalService: PersonalService,
    private readonly linksService: LinksService,
    private readonly sentence: SentenceService,
    private readonly activity: ActivityService,
  ) {}

  @Get()
  @Redirect()
  getIndex(@Param('crn') crn: string): RedirectResponse {
    return RedirectResponse.found(this.linksService.getUrl(BreadcrumbType.Case, { crn }))
  }

  @Get('overview')
  @Render('case/overview')
  @CaseTabbedPage({ page: CasePage.Overview, title: options => options.offenderName })
  async getOverview(@Param('crn') crn: string): Promise<CaseOverviewViewModel> {
    const [offender, compliance, nextAppointment, risks, registrations, personalCircumstances] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getSentenceComplianceDetails(crn),
      this.scheduleService.getNextAppointment(crn),
      this.riskService.getRisks(crn),
      this.riskService.getRiskRegistrations(crn),
      this.personalService.getPersonalCircumstances(crn),
    ])
    const [conviction] = await Promise.all([this.sentence.getCurrentConvictionSummary(crn)])
    let appointmentsMissingOutcomeCount = 0
    if (conviction) {
      const today = DateTime.now()
      const contacts = await this.activity.getActivityLogPage(crn, offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.WithoutOutcome,
      })
      appointmentsMissingOutcomeCount = contacts.content.flatMap(x => x.entries).filter(x => x.start < today).length
    }
    return this.offenderService.casePageOf<CaseOverviewViewModel>(offender, {
      page: CasePage.Overview,
      assessRisksAndNeedsApiStatus: risks.status,
      // HACK: We are not rendering personal contacts or needs on the overview page so provide an empty array instead
      ...this.personalService.getPersonalDetails(offender, null, personalCircumstances, null),
      compliance,
      nextAppointment,
      risks,
      registrations,
      appointmentsMissingOutcome: {
        count: appointmentsMissingOutcomeCount,
        activityFilterLink: `${this.linksService.getUrl(BreadcrumbType.CaseActivityLog, { crn })}/${
          ActivityComplianceFilter.WithoutOutcome
        }`,
      },
    })
  }
}
