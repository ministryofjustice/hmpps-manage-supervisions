import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import {
  OffenderActivityViewModel,
  OffenderComplianceViewModel,
  OffenderOverviewViewModel,
  OffenderPage,
  OffenderPageLinks,
  OffenderPersonalViewModel,
  OffenderRiskViewModel,
  OffenderScheduleViewModel,
  OffenderSentenceViewModel,
  OffenderViewModelBase,
} from './offender-view-model'
import { RedirectResponse } from '../../common'
import { OffenderDetailSummary } from '../../community-api/client'
import { ContactTypesService } from '../../community-api'
import { OffenderService } from './offender.service'
import { getDisplayName } from '../../util'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityFilter, ActivityService, FilterLinks, GetContactsOptions } from './activity'
import { RiskRegistrations, RiskService } from './risk'
import { PersonalService } from './personal'
import { Breadcrumb, BreadcrumbType, LinksService, ResolveBreadcrumbOptions } from '../../common/links'
import { ConfigService } from '@nestjs/config'
import { Config, FeatureFlags, ServerConfig } from '../../config'

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
    case OffenderPage.Compliance:
      return BreadcrumbType.Compliance
    case OffenderPage.Risk:
      return BreadcrumbType.CaseRisk
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
    private readonly contactTypesService: ContactTypesService,
    private readonly config: ConfigService<Config>,
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
    const [offender, conviction, appointmentSummary, risks, registrations, personalContacts, personalCircumstances] =
      await Promise.all([
        this.offenderService.getOffenderDetail(crn),
        this.sentenceService.getConvictionDetails(crn),
        this.scheduleService.getAppointmentSummary(crn),
        this.riskService.getRisks(crn),
        this.riskService.getRiskRegistrations(crn),
        this.personalService.getPersonalContacts(crn),
        this.personalService.getPersonalCircumstances(crn),
      ])
    return {
      ...this.getBase(OffenderPage.Overview, offender, registrations),
      page: OffenderPage.Overview,
      ...this.personalService.getPersonalDetails(offender, personalContacts, personalCircumstances),
      conviction: conviction && { ...conviction, rar: conviction.requirements.find(x => x.isRar)?.name },
      appointmentSummary,
      risks,
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
      this.offenderService.getOffenderSummary(crn),
      this.scheduleService.getRecentAppointments(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Schedule, offender, registrations),
      page: OffenderPage.Schedule,
      appointments,
      appointmentBookingEnabled:
        this.config.get<ServerConfig>('server').features[FeatureFlags.EnableAppointmentBooking],
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
    const [appointmentTypes, communicationTypes] = await Promise.all([
      this.contactTypesService.getAppointmentContactTypes(),
      this.contactTypesService.getCommunicationContactTypes(),
    ])

    return this.activityPageCommon(crn, { contactTypes: [...appointmentTypes, ...communicationTypes] })
  }

  @Get(`${OffenderPage.Activity}/:filter`)
  @Render('offenders/offender/views/activity')
  async getActivityFiltered(
    @Param('crn') crn: string,
    @Param('filter') filter: ActivityFilter,
  ): Promise<OffenderActivityViewModel> {
    const convictionId = await this.sentenceService.getConvictionId(crn)
    return this.activityPageCommon(crn, { convictionId, filter })
  }

  @Get(OffenderPage.Personal)
  @Render('offenders/offender/views/personal')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Personal),
    parent: BreadcrumbType.Case,
    title: 'Personal details',
  })
  async getPersonal(@Param('crn') crn: string): Promise<OffenderPersonalViewModel> {
    const [offender, registrations, personalContacts, personalCircumstances] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.riskService.getRiskRegistrations(crn),
      this.personalService.getPersonalContacts(crn),
      this.personalService.getPersonalCircumstances(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Personal, offender, registrations),
      ...this.personalService.getPersonalDetails(offender, personalContacts, personalCircumstances),
      page: OffenderPage.Personal,
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
      this.offenderService.getOffenderSummary(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Sentence, offender, registrations),
      page: OffenderPage.Sentence,
      conviction,
    }
  }

  @Get(OffenderPage.Compliance)
  @Render('offenders/offender/views/compliance')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Compliance),
    parent: BreadcrumbType.Case,
    title: 'Compliance',
  })
  async getCompliance(@Param('crn') crn: string): Promise<OffenderComplianceViewModel> {
    const [offender, compliance, registrations] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.sentenceService.getSentenceComplianceDetails(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Compliance, offender, registrations),
      page: OffenderPage.Compliance,
      compliance,
    }
  }

  @Get(OffenderPage.Risk)
  @Render('offenders/offender/views/risk')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Risk),
    parent: BreadcrumbType.Case,
    title: 'Risk',
  })
  async getRisk(@Param('crn') crn: string): Promise<OffenderRiskViewModel> {
    const [offender, registrations, risks] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.riskService.getRiskRegistrations(crn),
      this.riskService.getRisks(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Risk, offender, registrations),
      page: OffenderPage.Risk,
      risks,
    }
  }

  private getBase(
    page: OffenderPage,
    offender: OffenderDetailSummary,
    registrations: RiskRegistrations,
  ): OffenderViewModelBase {
    const crn = offender.otherIds.crn
    const breadcrumbOptions: ResolveBreadcrumbOptions = { crn, offenderName: getDisplayName(offender) }
    return {
      page,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      shortName: getDisplayName(offender, { middleNames: false, preferredName: false }),
      registrations,
      breadcrumbs: this.linksService.resolveAll(getBreadcrumbType(page), breadcrumbOptions),
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
        toDelius: `/offender/${crn}/to-delius`,
        toOASys: '#TODO',
        viewInactiveRegistrations: '#TODO',
      },
    }
  }

  private async activityPageCommon(crn: string, options: GetContactsOptions): Promise<OffenderActivityViewModel> {
    const [offender, contacts, registrations] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.activityService.getActivityLogPage(crn, options),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Activity, offender, registrations),
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      filters: FilterLinks,
      currentFilter: options.filter,
      title: options.filter ? FilterLinks[options.filter].description : null,
    }
  }
}
