import { Controller, Get, Post, Param, ParseIntPipe, Render } from '@nestjs/common'
import { EditSensitivityService } from './edit-sensitivity.service'

@Controller(`/case/:crn(\\w+)/activity/appointment/:id(\\d+)/sensitivity`)
export class EditSensitivityController {
  constructor(private readonly service: EditSensitivityService) {}

  @Get('edit')
  @Render('edit-sensitivity/edit')
  async edit(@Param('crn') crn: string, @Param('id', ParseIntPipe) id: number) {
    const appointment = await this.service.getAppointmentDetail(crn, id)
    return {
      sensitive: appointment.sensitive,
    }
  }

  @Post('edit')
  @Render('edit-sensitivity/edit')
  async update(@Param('crn') crn: string, @Param('id', ParseIntPipe) id: number) {
    const appointment = await this.service.getAppointmentDetail(crn, id)
    return {
      sensitive: appointment.sensitive,
    }
  }
}
