import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import { CaseOverviewViewModel, CasePage } from './case.types'
import { RedirectResponse } from '../common'
import { OffenderService } from './offender'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { RiskService } from './risk'
import { PersonalService } from './personal'
import { Breadcrumb, BreadcrumbType, LinksService } from '../common/links'

@Controller('case/:crn(\\w+)')
export class CaseController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly scheduleService: ScheduleService,
    private readonly sentenceService: SentenceService,
    private readonly riskService: RiskService,
    private readonly personalService: PersonalService,
    private readonly linksService: LinksService,
  ) {}

  @Get()
  @Redirect()
  getIndex(@Param('crn') crn: string): RedirectResponse {
    return RedirectResponse.found(this.linksService.getUrl(BreadcrumbType.Case, { crn }))
  }

  @Get('overview')
  @Render('case/overview')
  @Breadcrumb({ type: BreadcrumbType.Case, parent: BreadcrumbType.Cases, title: options => options.offenderName })
  async getOverview(@Param('crn') crn: string): Promise<CaseOverviewViewModel> {
    const [offender, compliance, nextAppointment, risks, registrations, personalCircumstances] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getSentenceComplianceDetails(crn),
      this.scheduleService.getNextAppointment(crn),
      this.riskService.getRisks(crn),
      this.riskService.getRiskRegistrations(crn),
      this.personalService.getPersonalCircumstances(crn),
    ])

    return this.offenderService.casePageOf<CaseOverviewViewModel>(offender, {
      page: CasePage.Overview,
      // We are not rendering personal contacts or needs on the overview page so provide an empty array instead
      ...this.personalService.getPersonalDetails(offender, [], personalCircumstances, []),
      compliance,
      nextAppointment,
      risks,
      registrations,
    })
  }
}