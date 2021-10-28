import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'
import { WizardSession } from '../form-builder'

export type AppointmentWizardSession = WizardSession<AppointmentBuilderDto, AppointmentWizardStep>
