import { ViewModel } from '../common'
import { ValidationError } from 'class-validator'
import { DateTime } from 'luxon'
import { RecordOutcomeDto } from './record-outcome.dto'
import { ToDeliusViewModel } from '../views/partials/exit/exit.types'
import { ContactDto, ContactV1ApiPatchContactRequest } from '../delius-api/client'

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
  contactTypeCode: string
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
  appointment?: RecordOutcomeAppointmentSummary
  errors?: ValidationError[] | null
  paths?: {
    back?: string
    next?: string
    compliance?: string
    rar?: string
    outcome?: string
    enforcement?: string
    notes?: string
    addNotes?: string
    sensitive?: string
  }
  offenderFirstName?: string
}

export interface RecordOutcomeComplianceViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Compliance> {
  compliance?: ComplianceOption
}

export interface RecordOutcomeRarViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Rar> {
  isRar?: boolean
}

export interface RecordOutcomeUnavailableViewModel
  extends RecordOutcomeViewModelBase<RecordOutcomeStep.Unavailable>,
    ToDeliusViewModel {
  reason: RecordOutcomeUnavailableReason
}

export interface RecordOutcomeFailedToAttendViewModel
  extends RecordOutcomeViewModelBase<RecordOutcomeStep.FailedToAttend> {
  acceptableAbsence?: boolean
}

export interface RecordOutcomeTypeViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Outcome> {
  compliance: ComplianceOption
  outcomes: KeyValue[]
  outcome?: string
}

export interface RecordOutcomeEnforcementViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Enforcement> {
  enforcementActions: KeyValue[]
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

export interface KeyValue {
  code: string
  description: string
}

export interface RecordOutcomeCheckViewModel extends RecordOutcomeViewModelBase<RecordOutcomeStep.Check> {
  outcome: RecordOutcomeDto
}

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

export interface PatchContactRequest extends ContactV1ApiPatchContactRequest {
  body: Operation[]
}

export interface RecordOutcomeResult<ServiceStatus extends RecordOutcomeStatus> {
  status: ServiceStatus
}

export enum RecordOutcomeStatus {
  OK = 'ok',
  ERROR = 'error',
}

export type RecordOutcomeSuccess = RecordOutcomeResult<RecordOutcomeStatus.OK> & ContactDto

export type RecordOutcomeFailure = RecordOutcomeResult<RecordOutcomeStatus.ERROR>

export interface Operation {
  op: string
  path: string
  value: any
}
