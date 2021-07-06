import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import {
  OffenderActivityViewModel,
  OffenderOverviewViewModel,
  OffenderPage,
  OffenderPageLinks,
  OffenderPersonalViewModel,
  OffenderScheduleViewModel,
  OffenderSentenceViewModel,
  OffenderViewModelBase,
} from './offender-view-model'
import { RedirectResponse } from '../../common'
import { OffenderDetail } from '../../community-api'
import { OffenderService } from './offender.service'
import { getDisplayName } from '../../util'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'
import { RiskService } from './risk/risk.service'
import { PersonalService } from './personal'
import { Breadcrumb, BreadcrumbType, LinksService, ResolveBreadcrumbOptions } from '../../common/links'

function getBreadcrumbType(type: OffenderPage): BreadcrumbType {
  switch (type) {
    case OffenderPage.Overview:
      return BreadcrumbType.Case
    case OffenderPage.Schedule:
      return BreadcrumbType.CaseSchedule
    case OffenderPage.Activity:
      return BreadcrumbType.CaseActivityLog
    case OffenderPage.Personal:
      return BreadcrumbType.PersonalDetails
    case OffenderPage.Sentence:
      return BreadcrumbType.CaseSentence
  }
}

@Controller('offender/:crn(\\w+)')
export class OffenderController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
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

  @Get(OffenderPage.Overview)
  @Render('offenders/offender/views/overview')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Overview),
    parent: BreadcrumbType.Cases,
    title: options => options.offenderName,
  })
  async getOverview(@Param('crn') crn: string): Promise<OffenderOverviewViewModel> {
    const [offender, conviction, appointmentSummary, risks, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.scheduleService.getAppointmentSummary(crn),
      this.riskService.getRisks(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, BreadcrumbType.Case, offender),
      page: OffenderPage.Overview,
      ...(await this.personalService.getPersonalDetails(offender)),
      conviction,
      appointmentSummary,
      risks,
      registrations,
    }
  }

  @Get(OffenderPage.Schedule)
  @Render('offenders/offender/views/schedule')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Schedule),
    parent: BreadcrumbType.Case,
    title: 'Schedule',
  })
  async getSchedule(@Param('crn') crn: string): Promise<OffenderScheduleViewModel> {
    const [offender, appointments, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.scheduleService.getRecentAppointments(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Schedule, BreadcrumbType.CaseSchedule, offender),
      page: OffenderPage.Schedule,
      appointments,
      registrations,
    }
  }

  @Get(OffenderPage.Activity)
  @Render('offenders/offender/views/activity')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Activity),
    parent: BreadcrumbType.Case,
    title: 'Activity log',
  })
  async getActivity(@Param('crn') crn: string): Promise<OffenderActivityViewModel> {
    const [offender, contacts, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.activityService.getActivityLogPage(crn, { appointmentsOnly: true }), // TODO just getting appointment contacts for now
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Activity, BreadcrumbType.CaseActivityLog, offender),
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      registrations,
    }
  }

  @Get(OffenderPage.Personal)
  @Render('offenders/offender/views/personal')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Personal),
    parent: BreadcrumbType.Case,
    title: 'Personal details',
  })
  async getPersonal(@Param('crn') crn: string): Promise<OffenderPersonalViewModel> {
    const [offender, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Personal, BreadcrumbType.PersonalDetails, offender),
      ...(await this.personalService.getPersonalDetails(offender)),
      page: OffenderPage.Personal,
      registrations,
    }
  }

  @Get(OffenderPage.Sentence)
  @Render('offenders/offender/views/sentence')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Sentence),
    parent: BreadcrumbType.Case,
    title: 'Sentence',
  })
  async getSentence(@Param('crn') crn: string): Promise<OffenderSentenceViewModel> {
    const [offender, conviction, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Sentence, BreadcrumbType.CaseSentence, offender),
      page: OffenderPage.Sentence,
      conviction,
      registrations,
    }
  }

  private getBase(page: OffenderPage, breadcrumb: BreadcrumbType, offender: OffenderDetail): OffenderViewModelBase {
    const crn = offender.otherIds.crn
    const breadcrumbOptions: ResolveBreadcrumbOptions = { crn, offenderName: getDisplayName(offender) }
    return {
      page,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      breadcrumbs: this.linksService.resolveAll(breadcrumb, breadcrumbOptions),
      links: {
        ...Object.values(OffenderPage).reduce(
          (agg, x) => ({ ...agg, [x]: this.linksService.getUrl(getBreadcrumbType(x), breadcrumbOptions) }),
          {} as OffenderPageLinks,
        ),
        arrangeAppointment: this.linksService.getUrl(BreadcrumbType.NewAppointment, breadcrumbOptions),
        addActivity: `/offender/${crn}/activity/new`,
        addressBook: this.linksService.getUrl(BreadcrumbType.PersonalAddresses, breadcrumbOptions),
        circumstances: this.linksService.getUrl(BreadcrumbType.PersonalCircumstances, breadcrumbOptions),
        disabilities: this.linksService.getUrl(BreadcrumbType.PersonalDisabilities, breadcrumbOptions),
      },
    }
  }
}
