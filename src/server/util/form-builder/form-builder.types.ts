import { ValidationError } from 'class-validator'
import { DeepPartial, FlatDeepPartial } from '../../app.types'
import { SecurityContext } from '../../security'

export enum StepType {
  Update,
  Confirmation,
  Complete,
}

export type StepFn<Dto, Step extends string> = (model: Dto) => Step

export type StepMeta<Dto, Step extends string> = {
  [S in Step]: {
    type: StepType
    next: Step | StepFn<Dto, Step> | null
  }
}

export interface WizardSession<Dto, Step extends string> {
  crn?: string
  dto?: FlatDeepPartial<Dto>
  completedSteps?: Step[]
  isComplete?: boolean
}

export type ViewModelFactory<Dto, Step extends string, ViewModel> = {
  [S in Step]: (
    session: WizardSession<Dto, Step>,
    body?: DeepPartial<Dto>,
    errors?: ValidationError[],
  ) => Promise<ViewModel> | ViewModel
}
export type SessionBuilder<Dto, Step extends string> = {
  init(session: WizardSession<Dto, Step>, security: SecurityContext): Promise<void> | void
} & {
  [S in Step]: (session: WizardSession<Dto, Step>, model: Dto) => Promise<ValidationError[]> | ValidationError[]
}
