import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common'
import { ActivityService } from './activity.service'
import { AppointmentViewModel, CommunicationViewModel } from './activity.types'
import { OffenderService } from '../offender.service'
import { getDisplayName } from '../../../util'
import { Breadcrumb, BreadcrumbType, LinksService } from '../../../common/links'

@Controller('offender/:crn(\\w+)/activity')
export class ActivityController {
  constructor(
    private readonly offender: OffenderService,
    private readonly activity: ActivityService,
    private readonly links: LinksService,
  ) {}

  @Get('appointment/:id(\\d+)')
  @Render('offenders/offender/activity/appointment')
  @Breadcrumb({
    type: BreadcrumbType.Appointment,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getAppointment(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentViewModel> {
    const [offender, appointment] = await Promise.all([
      this.offender.getOffenderSummary(crn),
      this.activity.getAppointment(crn, id),
    ])
    const displayName = getDisplayName(offender)
    return {
      displayName,
      appointment,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.Appointment, {
        crn,
        id,
        offenderName: displayName,
        entityName: appointment.name,
      }),
    }
  }

  @Get('communication/:id(\\d+)')
  @Render('offenders/offender/activity/communication')
  @Breadcrumb({
    type: BreadcrumbType.OtherCommunication,
    parent: BreadcrumbType.CaseActivityLog,
    title: options => options.entityName,
  })
  async getCommunication(
    @Param('crn') crn: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommunicationViewModel> {
    const offender = await this.offender.getOffenderSummary(crn)
    const displayName = getDisplayName(offender)
    const contact = await this.activity.getCommunicationContact(crn, id, displayName)
    return {
      displayName,
      contact,
      breadcrumbs: this.links.resolveAll(BreadcrumbType.OtherCommunication, {
        crn,
        id,
        offenderName: displayName,
        entityName: contact.name,
      }),
    }
  }
}
