import { DomainAppointmentType } from '../arrange-appointment.service'
import { ViewModel } from '../../common'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'

export enum AppointmentWizardStep {
  AppointmentType = 'type',
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
  | CheckAppointmentViewModel
  | ConfirmAppointmentViewModel
