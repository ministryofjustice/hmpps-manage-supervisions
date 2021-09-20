import { Controller, Get, Param, Render } from '@nestjs/common'
import { CasePage, CaseScheduleViewModel } from '../case.types'
import { Config, FeatureFlags, ServerConfig } from '../../config'
import { CaseBreadcrumb } from '../case.decorators'
import { OffenderService } from '../offender'
import { ScheduleService } from './schedule.service'
import { ConfigService } from '@nestjs/config'

@Controller('case/:crn(\\w+)/schedule')
export class ScheduleController {
  constructor(
    private readonly offenderService: OffenderService,
    private readonly service: ScheduleService,
    private readonly config: ConfigService<Config>,
  ) {}

  @Get()
  @Render('case/schedule/schedule')
  @CaseBreadcrumb({ page: CasePage.Schedule, title: 'Schedule' })
  async getSchedule(@Param('crn') crn: string): Promise<CaseScheduleViewModel> {
    const [offender, appointments] = await Promise.all([
      this.offenderService.getOffenderSummary(crn),
      this.service.getScheduledAppointments(crn),
    ])

    return this.offenderService.casePageOf<CaseScheduleViewModel>(offender, {
      page: CasePage.Schedule,
      appointments,
      appointmentBookingEnabled:
        this.config.get<ServerConfig>('server').features[FeatureFlags.EnableAppointmentBooking],
    })
  }
}
