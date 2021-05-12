import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { AppointmentWizardService } from './appointment-wizard.service'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { ArrangeAppointmentController } from './arrange-appointment.controller'

@Module({
  imports: [CommonModule],
  providers: [AppointmentWizardService, ArrangeAppointmentService],
  controllers: [ArrangeAppointmentController],
})
export class ArrangeAppointmentModule {}
