import { DomainAppointmentType } from '../arrange-appointment.service'
import { ViewModel } from '../../common'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentWizardUpdateWhenDto } from './AppointmentWizardUpdateWhen.dto'

export enum AppointmentWizardStep {
  AppointmentType = 'type',
  When = 'when',
  Check = 'check',
  Confirm = 'confirm',
}

interface AppointmentWizardViewModelBase extends ViewModel<AppointmentBuilderDto, 'appointment'> {
  step: AppointmentWizardStep
}

export interface AppointmentTypeViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.AppointmentType
  types: {
    featured: DomainAppointmentType[]
    other: DomainAppointmentType[]
  }
  type: string | null
  other: string | null
}

export interface AppointmentSchedulingViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.When
  form: AppointmentWizardUpdateWhenDto
}

export interface CheckAppointmentViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.Check
  rarDetails: {
    category: string
    subCategory: string
  }
}

export interface ConfirmAppointmentViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.Confirm
  offender: {
    firstName: string
    phoneNumber: string
  }
}

export type AppointmentWizardViewModel =
  | AppointmentTypeViewModel
  | AppointmentSchedulingViewModel
  | CheckAppointmentViewModel
  | ConfirmAppointmentViewModel
