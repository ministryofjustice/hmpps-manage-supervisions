import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import { difference } from 'lodash'
import { Injectable } from '@nestjs/common'
import { RedirectResponse } from '../common'
import { AppointmentBuilderDto } from './dto/AppointmentBuilderDto'
import { plainToClass } from 'class-transformer'
import { DEFAULT_GROUP } from '../util/mapping'
import { AppointmentTypeRequiresLocation } from '../community-api/client'

export function getStepUrl({ crn }: AppointmentWizardSession, step: AppointmentWizardStep) {
  return `/arrange-appointment/${crn}/${step}`
}

function toStep(session: AppointmentWizardSession, step: AppointmentWizardStep): RedirectResponse {
  const url = getStepUrl(session, step)
  return RedirectResponse.found(url)
}

type StepTransitionFunction = (model?: AppointmentBuilderDto) => AppointmentWizardStep

const meta: {
  [Step in AppointmentWizardStep]: {
    next: AppointmentWizardStep | StepTransitionFunction | null
  }
} = {
  [AppointmentWizardStep.Type]: {
    next(model?: AppointmentBuilderDto) {
      switch (model?.requiresLocation) {
        case AppointmentTypeRequiresLocation.Optional:
          return model.locationsAvailableForTeam ? AppointmentWizardStep.Where : AppointmentWizardStep.When
        case AppointmentTypeRequiresLocation.Required:
          return AppointmentWizardStep.Where
        default:
          return AppointmentWizardStep.When
      }
    },
  },
  [AppointmentWizardStep.Where]: {
    next: AppointmentWizardStep.When,
  },
  [AppointmentWizardStep.When]: {
    next: AppointmentWizardStep.AddNotes,
  },
  [AppointmentWizardStep.AddNotes]: {
    next(model?: AppointmentBuilderDto) {
      return model?.addNotes ? AppointmentWizardStep.Notes : AppointmentWizardStep.Sensitive
    },
  },
  [AppointmentWizardStep.Notes]: {
    next: AppointmentWizardStep.Sensitive,
  },
  [AppointmentWizardStep.Sensitive]: {
    next: AppointmentWizardStep.Check,
  },
  [AppointmentWizardStep.Check]: {
    next: AppointmentWizardStep.Confirm,
  },
  [AppointmentWizardStep.Confirm]: {
    next: null,
  },
}

function getSteps(session: AppointmentWizardSession): AppointmentWizardStep[] {
  const dto = plainToClass(AppointmentBuilderDto, session.appointment, {
    groups: [DEFAULT_GROUP],
    excludeExtraneousValues: true,
  })
  const rawSteps = Object.values(AppointmentWizardStep)
  const result: AppointmentWizardStep[] = rawSteps.slice(0, 1)

  let next: AppointmentWizardStep | null
  do {
    const current = result[result.length - 1]
    const stepMeta = meta[current]
    next = typeof stepMeta.next === 'function' ? stepMeta.next(dto) : stepMeta.next
    result.push(next)
  } while (next)

  return result
}

@Injectable()
export class AppointmentWizardService {
  reset(session: AppointmentWizardSession, crn: string): RedirectResponse {
    const [firstStep] = getSteps(session)
    session.crn = crn
    session.appointment = {}
    session.completedSteps = []
    return toStep(session, firstStep)
  }

  assertStep(session: AppointmentWizardSession, step: AppointmentWizardStep, crn: string): RedirectResponse | null {
    const steps = getSteps(session)
    const [firstStep, lastStep] = [steps[0], ...steps.slice(-1)]
    const completedSteps = session?.completedSteps || []

    // if the session is for a different offender
    // OR
    // the last step was completed & we're not also asserting the last step then assume a fresh wizard is required
    if (!session.appointment || crn !== session.crn || (completedSteps.includes(lastStep) && step !== lastStep)) {
      const toFirstStep = this.reset(session, crn)
      return step !== firstStep ? toFirstStep : null
    }

    // assert all previous steps completed
    const requiredSteps = steps.slice(0, steps.indexOf(step))
    const missingSteps = difference(requiredSteps, completedSteps)
    if (missingSteps.length > 0) {
      return toStep(session, missingSteps[0])
    }

    return null
  }

  recordStep(session: AppointmentWizardSession, step: AppointmentWizardStep) {
    if (session.completedSteps) {
      if (!session.completedSteps.includes(step)) {
        session.completedSteps.push(step)
      }
    } else {
      session.completedSteps = [step]
    }
  }

  nextStep(session: AppointmentWizardSession, step: AppointmentWizardStep): RedirectResponse {
    this.recordStep(session, step)
    const steps = getSteps(session)
    const nextIndex = (steps.indexOf(step) + 1) % steps.length
    return toStep(session, steps[nextIndex])
  }

  getBackUrl(session: AppointmentWizardSession, step: AppointmentWizardStep): string {
    const steps = getSteps(session)
    const currentIndex = steps.indexOf(step)
    if (currentIndex === 0) {
      return null
    }

    const previousIndex = (currentIndex - 1) % steps.length
    return getStepUrl(session, steps[previousIndex])
  }
}
