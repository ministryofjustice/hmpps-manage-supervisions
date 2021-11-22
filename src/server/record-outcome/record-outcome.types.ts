import { ViewModel } from '../common'
import { ValidationError } from 'class-validator'
import { DateTime } from 'luxon'

export enum RecordOutcomeStep {
  Compliance = 'compliance',
  Rar = 'rar',
  Unavailable = 'unavailable',
  FailedToAttend = 'failed-to-attend',
  Outcome = 'outcome',
  Enforcement = 'enforcement',
  AddNotes = 'add-notes',
  Notes = 'notes',
  Sensitive = 'sensitive',
  Check = 'check',
  Confirm = 'confirm',
}

export enum RecordOutcomeUnavailableReason {
  CountsTowardsRar = 'counts-towards-rar',
}

export enum ComplianceOption {
  ComplianceAcceptable = 'compliance-acceptable',
  FailedToComply = 'failed-to-comply',
  FailedToAttend = 'failed-to-attend',
}

export interface RecordOutcomeAppointmentSummary {
  id: number
  name: string
  start: DateTime
  end?: DateTime
}

export interface RecordOutcomeInitViewModel extends ViewModel {
  appointment: RecordOutcomeAppointmentSummary
  paths: {
    next: string
    viewAppointment: string
  }
}

export interface RecordOutcomeViewModelBase<Step extends RecordOutcomeStep> extends ViewModel {
  step: Step
  errors?: ValidationError[] | null
  paths?: {
    back?: string
    next?: string
  }
  offenderFirstName?: string
}

export interface RecordOutcomeComplianceViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Compliance> {
  compliance?: ComplianceOption
}

export interface RecordOutcomeRarViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Rar> {
  isRar?: boolean
}

export interface RecordOutcomeUnavailableViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Unavailable> {
  reason: RecordOutcomeUnavailableReason
}

export interface RecordOutcomeFailedToAttendViewModel
  extends RecordOutcomeViewModelBase<RecordOutcomeStep.FailedToAttend> {
  acceptableAbsence?: boolean
}

export interface RecordOutcomeTypeViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Outcome> {
  outcome?: string
}

export interface RecordOutcomeEnforcementViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Enforcement> {
  enforcement?: string
}

export interface RecordOutcomeAddNotesViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.AddNotes> {
  addNotes?: boolean
}

export interface RecordOutcomeNotesViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Notes> {
  notes?: string
}

export interface RecordOutcomeSensitiveViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Sensitive> {
  sensitive?: boolean
}

export type RecordOutcomeCheckViewModel = RecordOutcomeViewModelBase<RecordOutcomeStep.Check>

export type RecordOutcomeConfirmViewModel = RecordOutcomeViewModelBase<RecordOutcomeStep.Confirm>

export type RecordOutcomeViewModel =
  | RecordOutcomeComplianceViewModel
  | RecordOutcomeRarViewModel
  | RecordOutcomeUnavailableViewModel
  | RecordOutcomeFailedToAttendViewModel
  | RecordOutcomeTypeViewModel
  | RecordOutcomeEnforcementViewModel
  | RecordOutcomeAddNotesViewModel
  | RecordOutcomeNotesViewModel
  | RecordOutcomeSensitiveViewModel
  | RecordOutcomeCheckViewModel
  | RecordOutcomeConfirmViewModel
