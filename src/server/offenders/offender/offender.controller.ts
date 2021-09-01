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
import { ActivityComplianceFilter, ActivityService, FilterLinks, GetContactsOptions } from './activity'
import { RiskService } from './risk'
import { PersonalService } from './personal'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../common/links'
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
    const [offender, compliance, nextAppointment, risks, registrations, personalCircumstances] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getSentenceComplianceDetails(crn),
      this.scheduleService.getNextAppointment(crn),
      this.riskService.getRisks(crn),
      this.riskService.getRiskRegistrations(crn),
      this.personalService.getPersonalCircumstances(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      // We are not rendering personal contacts or needs on the overview page so provide an empty array instead
      ...this.personalService.getPersonalDetails(offender, [], personalCircumstances, []),
      compliance,
      nextAppointment,
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
    const [offender, appointments] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.scheduleService.getRecentAppointments(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Schedule, offender),
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
    @Param('filter') complianceFilter: ActivityComplianceFilter,
  ): Promise<OffenderActivityViewModel> {
    return this.activityPageCommon(crn, { complianceFilter })
  }

  @Get(OffenderPage.Personal)
  @Render('offenders/offender/views/personal')
  @Breadcrumb({
    type: getBreadcrumbType(OffenderPage.Personal),
    parent: BreadcrumbType.Case,
    title: 'Personal details',
  })
  async getPersonal(@Param('crn') crn: string): Promise<OffenderPersonalViewModel> {
    const [offender, personalContacts, personalCircumstances, criminogenicNeeds] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.personalService.getPersonalContacts(crn),
      this.personalService.getPersonalCircumstances(crn),
      this.riskService.getNeeds(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Personal, offender),
      ...this.personalService.getPersonalDetails(offender, personalContacts, personalCircumstances, criminogenicNeeds),
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
    const [offender, conviction] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.sentenceService.getConvictionDetails(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Sentence, offender),
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
    const [offender, compliance] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.sentenceService.getSentenceComplianceDetails(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Compliance, offender),
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
      ...this.getBase(OffenderPage.Risk, offender),
      risks,
      registrations,
    }
  }

  private getBase<Page extends OffenderPage>(page: Page, offender: OffenderDetailSummary): OffenderViewModelBase<Page> {
    const crn = offender.otherIds.crn
    const links = this.linksService.of({ crn, offenderName: getDisplayName(offender) })
    return {
      page,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      shortName: getDisplayName(offender, { middleNames: false, preferredName: false }),
      breadcrumbs: links.breadcrumbs(getBreadcrumbType(page)),
      links: {
        ...Object.values(OffenderPage).reduce(
          (agg, x) => ({ ...agg, [x]: links.url(getBreadcrumbType(x)) }),
          {} as OffenderPageLinks,
        ),
        arrangeAppointment: links.url(BreadcrumbType.NewAppointment),
        addActivity: links.url(BreadcrumbType.ExitToDelius),
        addressBook: links.url(BreadcrumbType.PersonalAddresses),
        circumstances: links.url(BreadcrumbType.PersonalCircumstances),
        disabilities: links.url(BreadcrumbType.PersonalDisabilities),
        toDelius: links.url(BreadcrumbType.ExitToDelius),
        toOASys: '#TODO',
        viewInactiveRegistrations: links.url(BreadcrumbType.RemovedRisksList),
        previousConvictions: links.url(BreadcrumbType.CasePreviousConvictions),
        startBreach: links.url(BreadcrumbType.ExitToDelius), // TODO: redirecting to delius interstitial for now
      },
    }
  }

  private async activityPageCommon(crn: string, options: GetContactsOptions): Promise<OffenderActivityViewModel> {
    const [offender, convictionId] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.sentenceService.getConvictionId(crn),
    ])
    const displayName = getDisplayName(offender)
    const contacts = await this.activityService.getActivityLogPage(crn, displayName, { ...options, convictionId })
    return {
      ...this.getBase(OffenderPage.Activity, offender),
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      filters: FilterLinks,
      currentFilter: options.complianceFilter,
      title: options.complianceFilter ? FilterLinks[options.complianceFilter].description : null,
    }
  }
}
