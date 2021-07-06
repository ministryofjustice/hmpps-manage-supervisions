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

@Controller('offender/:crn(\\w+)')
export class OffenderController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
    private readonly sentenceService: SentenceService,
    private readonly riskService: RiskService,
  ) {}

  @Get()
  @Redirect()
  getIndex(@Param('crn') crn: string): RedirectResponse {
    return RedirectResponse.found(`/offender/${crn}/overview`)
  }

  @Get('overview')
  @Render('offenders/offender/views/overview')
  async getOverview(@Param('crn') crn: string): Promise<OffenderOverviewViewModel> {
    const [offender, conviction, appointmentSummary, risks, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.scheduleService.getAppointmentSummary(crn),
      this.riskService.getRisks(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      page: OffenderPage.Overview,
      ...(await this.offenderService.getPersonalDetails(offender)),
      conviction,
      appointmentSummary,
      risks,
      registrations,
    }
  }

  @Get('schedule')
  @Render('offenders/offender/views/schedule')
  async getSchedule(@Param('crn') crn: string): Promise<OffenderScheduleViewModel> {
    const [offender, appointments, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.scheduleService.getRecentAppointments(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      page: OffenderPage.Schedule,
      appointments,
      registrations,
    }
  }

  @Get('activity')
  @Render('offenders/offender/views/activity')
  async getActivity(@Param('crn') crn: string): Promise<OffenderActivityViewModel> {
    const [offender, contacts, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.activityService.getActivityLogPage(crn, { appointmentsOnly: true }), // TODO just getting appointment contacts for now
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Activity, offender),
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
      registrations,
    }
  }

  @Get('personal')
  @Render('offenders/offender/views/personal')
  async getPersonal(@Param('crn') crn: string): Promise<OffenderPersonalViewModel> {
    const [offender, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Personal, offender),
      ...(await this.offenderService.getPersonalDetails(offender)),
      page: OffenderPage.Personal,
      registrations,
    }
  }

  @Get('sentence')
  @Render('offenders/offender/views/sentence')
  async getSentence(@Param('crn') crn: string): Promise<OffenderSentenceViewModel> {
    const [offender, conviction, registrations] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.riskService.getRiskRegistrations(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Sentence, offender),
      page: OffenderPage.Sentence,
      conviction,
      registrations,
    }
  }

  private getBase(page: OffenderPage, offender: OffenderDetail): OffenderViewModelBase {
    const crn = offender.otherIds.crn

    const pageLinks = Object.values(OffenderPage).reduce(
      (agg, x) => ({ ...agg, [x]: `/offender/${crn}/${x}` }),
      {} as OffenderPageLinks,
    )
    return {
      page,
      ids: {
        crn: crn.toUpperCase(),
        pnc: offender.otherIds.pncNumber,
      },
      displayName: getDisplayName(offender, { preferredName: true }),
      links: {
        ...pageLinks,
        arrangeAppointment: `/arrange-appointment/${crn}`,
        addActivity: `/offender/${crn}/activity/new`,
        addressBook: `/offender/${crn}/address-book`,
        circumstances: `/offender/${crn}/circumstances`,
        disabilities: `/offender/${crn}/disabilities`,
      },
    }
  }
}
