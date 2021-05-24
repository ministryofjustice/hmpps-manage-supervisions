import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { AppointmentWizardService } from './appointment-wizard.service'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { ArrangeAppointmentController } from './arrange-appointment.controller'
import { CommunityApiModule } from '../community-api/community-api.module'

@Module({
  imports: [CommonModule, CommunityApiModule],
  providers: [AppointmentWizardService, ArrangeAppointmentService],
  controllers: [ArrangeAppointmentController],
})
export class ArrangeAppointmentModule {}
