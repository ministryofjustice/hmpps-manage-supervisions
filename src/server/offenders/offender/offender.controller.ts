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
import { getOffenderDisplayName } from '../../util'
import { SentenceService } from './sentence'
import { ScheduleService } from './schedule'
import { ActivityService } from './activity'

@Controller('offender/:crn(\\w+)')
export class OffenderController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly scheduleService: ScheduleService,
    private readonly activityService: ActivityService,
    private readonly sentenceService: SentenceService,
  ) {}

  @Get()
  @Redirect()
  getIndex(@Param('crn') crn: string): RedirectResponse {
    return RedirectResponse.found(`/offender/${crn}/overview`)
  }

  @Get('overview')
  @Render('offenders/offender/views/overview')
  async getOverview(@Param('crn') crn: string): Promise<OffenderOverviewViewModel> {
    const [offender, conviction, appointmentSummary] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
      this.scheduleService.getAppointmentSummary(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      page: OffenderPage.Overview,
      ...this.offenderService.getPersonalDetails(offender),
      conviction,
      appointmentSummary,
    }
  }

  @Get('schedule')
  @Render('offenders/offender/views/schedule')
  async getSchedule(@Param('crn') crn: string): Promise<OffenderScheduleViewModel> {
    const [offender, appointments] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.scheduleService.getRecentAppointments(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      page: OffenderPage.Schedule,
      appointments,
    }
  }

  @Get('activity')
  @Render('offenders/offender/views/activity')
  async getActivity(@Param('crn') crn: string): Promise<OffenderActivityViewModel> {
    const [offender, contacts] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.activityService.getActivityLogPage(crn, { appointmentsOnly: true }), // TODO just getting appointment contacts for now
    ])
    return {
      ...this.getBase(OffenderPage.Activity, offender),
      page: OffenderPage.Activity,
      contacts: contacts.content,
      pagination: {
        page: contacts.number,
        size: contacts.size,
      },
    }
  }

  @Get('personal')
  @Render('offenders/offender/views/personal')
  async getPersonal(@Param('crn') crn: string): Promise<OffenderPersonalViewModel> {
    const offender = await this.offenderService.getOffenderDetail(crn)
    return {
      ...this.getBase(OffenderPage.Personal, offender),
      ...this.offenderService.getPersonalDetails(offender),
      page: OffenderPage.Personal,
    }
  }

  @Get('sentence')
  @Render('offenders/offender/views/sentence')
  async getSentence(@Param('crn') crn: string): Promise<OffenderSentenceViewModel> {
    const [offender, conviction] = await Promise.all([
      this.offenderService.getOffenderDetail(crn),
      this.sentenceService.getConvictionDetails(crn),
    ])
    return {
      ...this.getBase(OffenderPage.Sentence, offender),
      page: OffenderPage.Sentence,
      conviction,
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
      },
      displayName: getOffenderDisplayName(offender),
      links: {
        ...pageLinks,
        arrangeAppointment: `/arrange-appointment/${crn}`,
        addActivity: `/offender/${crn}/activity/new`,
      },
    }
  }
}
