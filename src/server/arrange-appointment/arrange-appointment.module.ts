import { Module } from '@nestjs/common'
import { CommonModule } from '../common/common.module'
import { AppointmentFormBuilderService } from './appointment-form-builder.service'
import { ArrangeAppointmentService } from './arrange-appointment.service'
import { ArrangeAppointmentController } from './arrange-appointment.controller'
import { CommunityApiModule } from '../community-api/community-api.module'
import { ViewModelFactoryService } from './view-model-factory/view-model-factory.service'
import { SessionBuilderService } from './session-builder/session-builder.service'

@Module({
  imports: [CommonModule, CommunityApiModule],
  providers: [AppointmentFormBuilderService, ArrangeAppointmentService, ViewModelFactoryService, SessionBuilderService],
  controllers: [ArrangeAppointmentController],
})
export class ArrangeAppointmentModule {}
