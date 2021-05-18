import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import { difference } from 'lodash'
import { Injectable } from '@nestjs/common'
import { RedirectResponse } from '../common'

const steps = Object.freeze(Object.values(AppointmentWizardStep))
const firstStep = steps[0]
const lastStep = steps[steps.length - 1]

export function getStepUrl(step: AppointmentWizardStep, crn: string) {
  return `/arrange-appointment/${crn}/${step}`
}

function toStep(step: AppointmentWizardStep, crn: string): RedirectResponse {
  return RedirectResponse.found(getStepUrl(step, crn))
}

@Injectable()
export class AppointmentWizardService {
  firstStep(crn: string): RedirectResponse {
    return toStep(firstStep, crn)
  }

  assertStep(session: AppointmentWizardSession, step: AppointmentWizardStep, crn: string): RedirectResponse | null {
    const completedSteps = session?.completedSteps || []

    // if the last step was completed & we're not also asserting the last step then assume a fresh wizard is required
    if (completedSteps.includes(lastStep) && step !== lastStep) {
      session.appointment = null
      session.completedSteps = []
      if (step !== firstStep) {
        return this.firstStep(crn)
      } else {
        return null
      }
    }

    // assert all previous steps completed
    const requiredSteps = steps.slice(0, steps.indexOf(step))
    const missingSteps = difference(requiredSteps, completedSteps)
    if (missingSteps.length > 0) {
      return toStep(missingSteps[0], crn)
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

  nextStep(session: AppointmentWizardSession, step: AppointmentWizardStep, crn: string): RedirectResponse {
    this.recordStep(session, step)
    const nextIndex = (steps.indexOf(step) + 1) % steps.length
    return toStep(steps[nextIndex], crn)
  }

  getBackPath(currentStep: AppointmentWizardStep, crn: string): string {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex === 0) {
      return null
    }

    const previousIndex = (currentIndex - 1) % steps.length
    return getStepUrl(steps[previousIndex], crn)
  }
}
