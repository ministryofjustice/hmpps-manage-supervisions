import { DomainAppointmentType } from '../arrange-appointment.service'
import { ViewModel } from '../../common'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { OfficeLocation } from './OfficeLocation'

export enum AppointmentWizardStep {
  Type = 'type',
  Where = 'where',
  When = 'when',
  Sensitive = 'sensitive',
  Check = 'check',
  Confirm = 'confirm',
}

interface AppointmentWizardViewModelBase extends ViewModel<AppointmentBuilderDto, 'appointment'> {
  step: AppointmentWizardStep
}

export interface AppointmentTypeViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.Type
  types: {
    featured: DomainAppointmentType[]
    other: DomainAppointmentType[]
  }
  type: string | null
  other: string | null
}

export interface AppointmentLocationViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.Where
  location: string
  locations: OfficeLocation[]
}

export interface AppointmentSchedulingViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.When
  date: { day: number; month: number; year: number }
  startTime: string
  endTime: string
}

export interface AppointmentSensitiveViewModel extends AppointmentWizardViewModelBase {
  step: AppointmentWizardStep.Sensitive
  sensitive?: boolean
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
  | AppointmentLocationViewModel
  | AppointmentSchedulingViewModel
  | AppointmentSensitiveViewModel
  | CheckAppointmentViewModel
  | ConfirmAppointmentViewModel
