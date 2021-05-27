import { Controller, Get, Param, Redirect, Render } from '@nestjs/common'
import {
  OffenderLinks,
  OffenderOverviewViewModel,
  OffenderPage,
  OffenderScheduleViewModel,
  OffenderViewModelBase,
} from './offender-view-model'
import { RedirectResponse } from '../../common'
import { OffenderDetail } from '../../community-api'
import { OffenderService } from './offender.service'

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

  private getBase(page: OffenderPage, offender: OffenderDetail): OffenderViewModelBase {
    const crn = offender.otherIds.crn
    const displayName = [offender.firstName, ...(offender.middleNames || []), offender.surname].filter(x => x).join(' ')
    const links = Object.values(OffenderPage).reduce((agg, x) => ({ ...agg, [x]: `/offender/${crn}/${x}` }), {
      arrangeAppointment: `/arrange-appointment/${crn}`,
    } as OffenderLinks)
    return {
      page,
      ids: {
        crn: crn.toUpperCase(),
      },
      displayName,
      links,
    }
  }
}
