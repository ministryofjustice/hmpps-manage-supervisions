import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import {
  OffenderActivityViewModel,
  OffenderOverviewViewModel,
  OffenderPage,
  OffenderPageLinks,
  OffenderPersonalViewModel,
  OffenderScheduleViewModel,
  OffenderViewModelBase,
} from './offender-view-model'
import { RedirectResponse } from '../../common'
import { OffenderDetail } from '../../community-api'
import { OffenderService } from './offender.service'
import { getOffenderDisplayName } from '../../util'

@Controller('offender/:crn(\\w+)')
export class OffenderController {
  constructor(private readonly service: OffenderService) {}

  @Get()
  @Redirect()
  getIndex(@Param('crn') crn: string): RedirectResponse {
    return RedirectResponse.found(`/offender/${crn}/overview`)
  }

  @Get('overview')
  @Render('offenders/offender/views/overview')
  async getOverview(@Param('crn') crn: string): Promise<OffenderOverviewViewModel> {
    const offender = await this.service.getOffenderDetail(crn)
    return {
      ...this.getBase(OffenderPage.Overview, offender),
      page: OffenderPage.Overview,
      contactDetails: offender.contactDetails,
    }
  }

  @Get('schedule')
  @Render('offenders/offender/views/schedule')
  async getSchedule(@Param('crn') crn: string): Promise<OffenderScheduleViewModel> {
    const [offender, appointments] = await Promise.all([
      this.service.getOffenderDetail(crn),
      this.service.getRecentAppointments(crn),
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
      this.service.getOffenderDetail(crn),
      this.service.getActivityLogPage(crn, { appointmentsOnly: true }), // TODO just getting appointment contacts for now
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
    const offender = await this.service.getOffenderDetail(crn)
    return {
      ...this.getBase(OffenderPage.Personal, offender),
      ...this.service.getPersonalDetails(offender),
      page: OffenderPage.Personal,
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
