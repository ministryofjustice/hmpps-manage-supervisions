import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { WizardSession } from '../../util/form-builder'
import { AppointmentWizardStep } from './arrange-appointment.types'

export type AppointmentWizardSession = WizardSession<AppointmentBuilderDto, AppointmentWizardStep>
