import { RedirectResponse } from '../common'
import { difference } from 'lodash'
import { plainToClass, ClassConstructor } from 'class-transformer'
import { DEFAULT_GROUP } from '../util/mapping'
import { FlatDeepPartial } from '../app.types'

type StepTransitionFunction<Dto, Step extends string> = (model?: Dto) => Step

export type StepMeta<Dto, Step extends string> = {
  [S in Step]: {
    next: Step | StepTransitionFunction<Dto, Step> | null
  }
}

export interface WizardSession<Dto, Step extends string> {
  crn: string
  dto?: FlatDeepPartial<Dto>
  completedSteps?: Step[]
}

export class FormBuilder<Dto, Step extends string> {
  constructor(
    private readonly DtoClass: ClassConstructor<Dto>,
    private readonly StepEnum: any, // TODO
    private readonly meta: StepMeta<Dto, Step>,
  ) {}

  reset(session: WizardSession<Dto, Step>, crn: string): RedirectResponse {
    const [firstStep] = this.getSteps(session)
    session.crn = crn
    session.dto = {}
    session.completedSteps = []
    return this.toStep(session, firstStep)
  }

  assertStep(session: WizardSession<Dto, Step>, step: Step, crn: string): RedirectResponse | null {
    const steps = this.getSteps(session)
    const [firstStep, lastStep] = [steps[0], ...steps.slice(-1)]
    const completedSteps = session?.completedSteps || []

    // if the session is for a different offender
    // OR
    // the last step was completed & we're not also asserting the last step then assume a fresh wizard is required
    if (!session.dto || crn !== session.crn || (completedSteps.includes(lastStep) && step !== lastStep)) {
      const toFirstStep = this.reset(session, crn)
      return step !== firstStep ? toFirstStep : null
    }

    // assert all previous steps completed
    const requiredSteps = steps.slice(0, steps.indexOf(step))
    const missingSteps = difference(requiredSteps, completedSteps)
    if (missingSteps.length > 0) {
      return this.toStep(session, missingSteps[0])
    }

    return null
  }

  recordStep(session: WizardSession<Dto, Step>, step: Step) {
    if (session.completedSteps) {
      if (!session.completedSteps.includes(step)) {
        session.completedSteps.push(step)
      }
    } else {
      session.completedSteps = [step]
    }
  }

  nextStep(session: WizardSession<Dto, Step>, step: Step): RedirectResponse {
    this.recordStep(session, step)
    const steps = this.getSteps(session)
    const nextIndex = (steps.indexOf(step) + 1) % steps.length
    return this.toStep(session, steps[nextIndex])
  }

  getBackUrl(session: WizardSession<Dto, Step>, step: Step): string {
    const steps = this.getSteps(session)
    const currentIndex = steps.indexOf(step)
    if (currentIndex === 0) {
      return null
    }

    const previousIndex = (currentIndex - 1) % steps.length
    return this.getStepUrl(session, steps[previousIndex])
  }

  private toStep(session: WizardSession<Dto, Step>, step: Step): RedirectResponse {
    const url = this.getStepUrl(session, step)
    return RedirectResponse.found(url)
  }

  getStepUrl({ crn }: WizardSession<Dto, Step>, step: Step) {
    // TODO use the links service
    return `/arrange-appointment/${crn}/${step}`
  }

  private getSteps(session: WizardSession<Dto, Step>): Step[] {
    const dto = plainToClass(this.DtoClass, session.dto, {
      groups: [DEFAULT_GROUP],
      excludeExtraneousValues: true,
    })
    const rawSteps = Object.values(this.StepEnum) as Step[]
    const result = rawSteps.slice(0, 1)

    let next: Step | null
    do {
      const current = result[result.length - 1]
      const stepMeta = this.meta[current]
      next = typeof stepMeta.next === 'function' ? stepMeta.next(dto) : stepMeta.next
      result.push(next)
    } while (next)

    return result
  }
}
