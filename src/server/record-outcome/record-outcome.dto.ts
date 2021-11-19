import { IsBoolean, IsEnum, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import striptags = require('striptags')
import { ExposeDefault, ToBoolean } from '../util/mapping'
import {
  AvailableContactOutcomeTypes,
  ContactOutcomeTypeDetail,
  ContactType,
  OffenderDetail,
} from '../community-api/client'
import {
  ComplianceOption,
  RecordOutcomeAppointmentSummary,
  RecordOutcomeStep,
  RecordOutcomeUnavailableReason,
} from './record-outcome.types'
import { WizardSession } from '../util/form-builder'
import { IsInFn } from '../validators/IsInFn'
import { ValidationGroup } from '../validators'

export const MESSAGES: Partial<Record<RecordOutcomeStep, Record<string, string>>> = {
  compliance: {
    required: 'Select yes if attended and the outcome was acceptable',
  },
  rar: {
    required: 'Select yes if this appointment will count towards RAR',
  },
  'failed-to-attend': {
    required: 'Select yes if the reason for absence was acceptable',
  },
  outcome: {
    required: 'Select an outcome',
  },
  enforcement: {
    required: 'Select an enforcement',
  },
  'add-notes': {
    required: 'Select yes if you would like to add notes',
  },
  notes: {
    required: 'Add appointment notes',
  },
  sensitive: {
    required: 'Select yes if the appointment contains sensitive information',
  },
}

export class RecordOutcomeDto {
  /**
   * Details of the offender who this appointment relates to
   */
  @ExposeDefault()
  offender?: OffenderDetail

  /**
   * The appointment that this outcome will be recorded against.
   */
  @ExposeDefault()
  appointment: RecordOutcomeAppointmentSummary

  /**
   * The type of the appointment that this outcome will be record against.
   * Note: this is retrieved during init.
   */
  @ExposeDefault()
  contactType: ContactType

  /**
   * The available outcome types for the appointment type.
   * Note: this is retrieved during init.
   */
  @ExposeDefault()
  availableOutcomeTypes: AvailableContactOutcomeTypes

  /**
   * The reason that adding this outcome is not possible at this time.
   * Note: this is set server side so there is no validation.
   */
  @ExposeDefault()
  unavailableReason?: RecordOutcomeUnavailableReason

  @ExposeDefault({ groups: [RecordOutcomeStep.Compliance] })
  @IsEnum(ComplianceOption, { message: MESSAGES.compliance.required, groups: [RecordOutcomeStep.Compliance] })
  compliance?: ComplianceOption

  @ExposeDefault({ groups: [RecordOutcomeStep.Rar] })
  @ToBoolean()
  @IsBoolean({ message: MESSAGES.rar.required, groups: [RecordOutcomeStep.Rar] })
  isRar?: boolean

  @ExposeDefault({ groups: [RecordOutcomeStep.FailedToAttend] })
  @ToBoolean()
  @IsBoolean({ message: MESSAGES['failed-to-attend'].required, groups: [RecordOutcomeStep.FailedToAttend] })
  acceptableAbsence?: boolean

  @ExposeDefault({ groups: [RecordOutcomeStep.Outcome] })
  @ValidationGroup({ message: MESSAGES.outcome.required, groups: [RecordOutcomeStep.Outcome] }, IsString, options =>
    IsInFn((obj: RecordOutcomeDto) => obj.availableOutcomeTypes?.outcomeTypes?.map(x => x.code), options),
  )
  outcome?: string

  @ExposeDefault({ groups: [RecordOutcomeStep.Enforcement] })
  @IsString({ message: MESSAGES.enforcement.required, groups: [RecordOutcomeStep.Enforcement] })
  @ValidationGroup(
    { message: MESSAGES.enforcement.required, groups: [RecordOutcomeStep.Enforcement] },
    IsString,
    options => IsInFn((obj: RecordOutcomeDto) => obj.selectedOutcome?.enforcements?.map(x => x.code), options),
  )
  enforcement?: string

  @ExposeDefault({ groups: [RecordOutcomeStep.AddNotes] })
  @ToBoolean()
  @IsBoolean({ message: MESSAGES['add-notes'].required, groups: [RecordOutcomeStep.AddNotes] })
  addNotes?: boolean

  @ExposeDefault({ groups: [RecordOutcomeStep.Notes] })
  @Transform(({ value }) => (value ? striptags(value) : value))
  @IsString({ message: MESSAGES.notes.required, groups: [RecordOutcomeStep.Notes] })
  notes?: string

  @ExposeDefault({ groups: [RecordOutcomeStep.Sensitive] })
  @ToBoolean()
  @IsBoolean({ message: MESSAGES.sensitive.required, groups: [RecordOutcomeStep.Sensitive] })
  sensitive?: boolean

  get selectedOutcome(): ContactOutcomeTypeDetail | null {
    if (!this.outcome || !this.availableOutcomeTypes) {
      return null
    }
    return this.availableOutcomeTypes.outcomeTypes?.find(x => x.code === this.outcome) || null
  }

  get selectedEnforcement() {
    if (!this.enforcement || !this.availableOutcomeTypes) {
      return null
    }
    return this.selectedOutcome?.enforcements?.find(x => x.code === this.enforcement) || null
  }
}

export type RecordOutcomeSession = WizardSession<RecordOutcomeDto, RecordOutcomeStep>
