import { ViewModel } from '../../common'
import { AppointmentBuilderDto } from './AppointmentBuilderDto'
import { AppointmentType, OfficeLocation } from '../../community-api/client'
import { WellKnownAppointmentType, WellKnownAppointmentTypeMeta } from '../../config'
import { ValidationError } from 'class-validator'
import {
  AlternateLocation,
  AppointmentBookingUnavailableReason,
  AppointmentWizardStep,
} from './arrange-appointment.types'

interface AppointmentWizardViewModelBase<Step extends AppointmentWizardStep> extends ViewModel {
  step: Step
  errors?: ValidationError[] | null
  paths?: {
    back?: string
    type?: string
    where?: string
    when?: string
    next?: string
    sensitive?: string
    notes?: string
  }
  appointment: AppointmentBuilderDto
}

export interface FeaturedAppointmentType {
  type: WellKnownAppointmentType
  description: string
  meta: WellKnownAppointmentTypeMeta
  appointmentTypes: AppointmentType[]
}

export type OtherAppointmentType = AppointmentType

export interface AvailableAppointmentTypes {
  featured: FeaturedAppointmentType[]
  other: OtherAppointmentType[]
}

export interface AppointmentTypeViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Type> {
  types: AvailableAppointmentTypes
  type: string | null
  otherType: string | null
}

export interface AppointmentLocationViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Where> {
  location: string
  locations: OfficeLocation[]
  alternateLocations: AlternateLocation[]
}

export interface AppointmentSchedulingViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.When> {
  date: { day: number; month: number; year: number }
  startTime: string
  endTime: string

  offender: {
    firstName: string
    personalCircumstances: {
      language: string
      disabilities: string
      employment: string
    }
  }
}

export interface AppointmentAddNotesViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.AddNotes> {
  addNotes?: boolean
}
export interface AppointmentNotesViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Notes> {
  notes: string
}
export interface AppointmentSensitiveViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Sensitive> {
  sensitive?: boolean
}

export interface CheckAppointmentViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Check> {
  rarDetails: {
    category: string
    subCategory: string
  }
}

export interface ConfirmAppointmentViewModel extends AppointmentWizardViewModelBase<AppointmentWizardStep.Confirm> {
  offender: {
    firstName: string
    phoneNumber: string
  }
}

export interface UnavailableAppointmentViewModel
  extends AppointmentWizardViewModelBase<AppointmentWizardStep.Unavailable> {
  reason: AppointmentBookingUnavailableReason
  offender: {
    displayName: string
  }
  links: {
    exit: string
  }
}

export type AppointmentWizardViewModel =
  | AppointmentTypeViewModel
  | AppointmentLocationViewModel
  | AppointmentSchedulingViewModel
  | AppointmentAddNotesViewModel
  | AppointmentNotesViewModel
  | AppointmentSensitiveViewModel
  | CheckAppointmentViewModel
  | ConfirmAppointmentViewModel
  | UnavailableAppointmentViewModel
