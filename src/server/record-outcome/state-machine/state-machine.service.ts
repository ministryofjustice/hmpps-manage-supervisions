import { Injectable } from '@nestjs/common'
import { FormBuilderService, StepMeta, StepType } from '../../util/form-builder'
import { RecordOutcomeDto } from '../record-outcome.dto'
import { ComplianceOption, RecordOutcomeStep, RecordOutcomeUnavailableReason } from '../record-outcome.types'
import { BreadcrumbType, LinksService } from '../../common/links'

const meta: StepMeta<RecordOutcomeDto, RecordOutcomeStep> = {
  compliance: {
    type: StepType.Update,
    next: model => {
      switch (model.compliance) {
        case ComplianceOption.FailedToAttend:
          return RecordOutcomeStep.FailedToAttend
        case ComplianceOption.FailedToComply:
          return RecordOutcomeStep.Outcome
        default:
          return RecordOutcomeStep.Rar
      }
    },
  },
  [RecordOutcomeStep.FailedToAttend]: {
    type: StepType.Update,
    next: RecordOutcomeStep.Outcome,
  },
  [RecordOutcomeStep.Outcome]: {
    type: StepType.Update,
    // TODO skip enforcement when the selected outcome is not enforceable or has no enforcements
    next: RecordOutcomeStep.Enforcement,
  },
  [RecordOutcomeStep.Enforcement]: {
    type: StepType.Update,
    next: RecordOutcomeStep.AddNotes,
  },
  rar: {
    type: StepType.Update,
    next: model => {
      if (model.unavailableReason === RecordOutcomeUnavailableReason.CountsTowardsRar) {
        return RecordOutcomeStep.Unavailable
      }
      return RecordOutcomeStep.AddNotes
    },
  },
  'add-notes': {
    type: StepType.Update,
    next: model => (model.addNotes ? RecordOutcomeStep.Notes : RecordOutcomeStep.Sensitive),
  },
  notes: {
    type: StepType.Update,
    next: RecordOutcomeStep.Sensitive,
  },
  sensitive: {
    type: StepType.Update,
    next: RecordOutcomeStep.Check,
  },
  check: {
    type: StepType.Confirmation,
    next: RecordOutcomeStep.Confirm,
  },
  confirm: {
    type: StepType.Complete,
    next: null,
  },
  unavailable: {
    type: StepType.Confirmation,
    next: null,
  },
}

@Injectable()
export class StateMachineService extends FormBuilderService<RecordOutcomeDto, RecordOutcomeStep> {
  constructor(links: LinksService) {
    super(
      RecordOutcomeDto,
      RecordOutcomeStep,
      meta,
      links,
      BreadcrumbType.RecordOutcome,
      BreadcrumbType.RecordOutcomeStep,
    )
  }
}
