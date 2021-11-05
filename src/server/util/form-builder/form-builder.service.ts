import { NotFoundException } from '@nestjs/common'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { RedirectResponse } from '../../common/dynamic-routing'
import { BreadcrumbType, LinksService } from '../../common/links'
import { difference } from 'lodash'
import { DEFAULT_GROUP } from '../mapping'
import { StepMeta, StepType, WizardSession } from './form-builder.types'

export abstract class FormBuilderService<Dto, Step extends string> {
  protected constructor(
    private readonly DtoClass: ClassConstructor<Dto>,
    private readonly StepEnum: any, // TODO
    private readonly meta: StepMeta<Dto, Step>,
    private readonly links: LinksService,
    private readonly resetBreadcrumb: BreadcrumbType,
    private readonly stepBreadcrumb: BreadcrumbType,
  ) {}

  resetToFirstStep(session: WizardSession<Dto, Step>, crn: string): RedirectResponse {
    session.crn = crn
    session.dto = {}
    session.completedSteps = []
    session.isComplete = false
    const steps = this.getSteps(session)
    return this.toStep(session, steps[0])
  }

  assertStep(
    session: WizardSession<Dto, Step>,
    step: Step,
    crn: string,
    method: 'get' | 'post',
  ): RedirectResponse | null {
    if (!session.dto || !session.completedSteps || !session.crn) {
      return this.toReset(crn)
    }

    const stepMeta = this.meta[step]
    if (method === 'post' && stepMeta.type !== StepType.Update) {
      throw new NotFoundException(`the ${step} is confirmation only & cannot be submitted`)
    }

    const steps = this.getSteps(session)
    const firstStep = steps[0]
    const completedSteps = session?.completedSteps || []
    const lastCompletedStep = completedSteps.length > 0 ? completedSteps[completedSteps.length - 1] : null

    // if the session is for a different offender
    // OR
    // the last step was completed & we're not also asserting the last step then assume a fresh wizard is required
    if (!session.dto || crn !== session.crn || (session.isComplete && stepMeta.type !== StepType.Complete)) {
      return this.toReset(crn)
    }

    // if the current step isn't in the current run of steps then redirect back to the current step
    if (!steps.includes(step)) {
      if (!lastCompletedStep) {
        return this.toStep(session, firstStep)
      }
      const lastCompletedStepIndex = steps.indexOf(lastCompletedStep)
      if (lastCompletedStepIndex === steps.length - 1) {
        return this.toStep(session, steps[steps.length - 1])
      }
      if (lastCompletedStepIndex < 0) {
        return this.toReset(crn)
      }
      return this.toStep(session, steps[lastCompletedStepIndex + 1])
    }

    // assert all previous steps completed
    const requiredSteps = steps.slice(0, steps.indexOf(step))
    const missingSteps = difference(requiredSteps, completedSteps)
    if (missingSteps.length > 0) {
      return this.toStep(session, missingSteps[0])
    }

    // if we are asserting a non update step then we should mark it as complete
    if (stepMeta.type !== StepType.Update) {
      this.recordStep(session, step)
    }

    return null
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

  getStepUrl({ crn }: WizardSession<Dto, Step>, step: Step) {
    return this.links.getUrl(this.stepBreadcrumb, { crn, step })
  }

  private toReset(crn: string): RedirectResponse {
    return RedirectResponse.found(this.links.getUrl(this.resetBreadcrumb, { crn }))
  }

  private recordStep(session: WizardSession<Dto, Step>, step: Step) {
    if (session.completedSteps) {
      if (!session.completedSteps.includes(step)) {
        session.completedSteps.push(step)
      }
    } else {
      session.completedSteps = [step]
    }

    const meta = this.meta[step]
    if (meta.type === StepType.Complete) {
      session.isComplete = true
    }
  }

  private toStep(session: WizardSession<Dto, Step>, step: Step): RedirectResponse {
    const url = this.getStepUrl(session, step)
    return RedirectResponse.found(url)
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

      if (next) {
        result.push(next)
      }
    } while (next)

    return result
  }
}
