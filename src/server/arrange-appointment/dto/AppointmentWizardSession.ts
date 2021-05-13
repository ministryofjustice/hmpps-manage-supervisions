import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'

export interface AppointmentWizardSession {
  appointment?: FlatDeepPartial<AppointmentBuilderDto>
  completedSteps?: AppointmentWizardStep[]
}
