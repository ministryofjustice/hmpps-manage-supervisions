import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'

export interface AppointmentWizardSession {
  crn: string
  appointment?: FlatDeepPartial<AppointmentBuilderDto>
  completedSteps?: AppointmentWizardStep[]
}
