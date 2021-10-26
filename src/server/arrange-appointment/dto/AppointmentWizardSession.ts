import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'
import { FlatDeepPartial } from '../../app.types'

export interface AppointmentWizardSession {
  crn: string
  appointment?: FlatDeepPartial<AppointmentBuilderDto>
  completedSteps?: AppointmentWizardStep[]
}
