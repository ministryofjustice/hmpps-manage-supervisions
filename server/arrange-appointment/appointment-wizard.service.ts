import { Service } from 'typedi'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import { difference } from 'lodash'
import { RedirectException } from '../mvc'

const steps = Object.values(AppointmentWizardStep)
const firstStep = steps[0]
const lastStep = steps[steps.length - 1]

function getStepUrl(step: AppointmentWizardStep, crn: string) {
  return `/arrange-appointment/${crn}/${step}`
}

function toStep(step: AppointmentWizardStep, crn: string): never {
  throw new RedirectException(getStepUrl(step, crn))
}

@Service()
export class AppointmentWizardService {
  assertStep(session: AppointmentWizardSession, step: AppointmentWizardStep, crn: string) {
    const completedSteps = session?.completedSteps || []

    // if the last step was completed & we're not also asserting the last step then assume a fresh wizard is required
    if (completedSteps.includes(lastStep) && step !== lastStep) {
      session.appointment = null
      session.completedSteps = []
      if (step !== firstStep) {
        this.firstStep(crn)
      } else {
        return
      }
    }

    // assert all previous steps completed
    const requiredSteps = steps.slice(0, steps.indexOf(step))
    const missingSteps = difference(requiredSteps, completedSteps)
    if (missingSteps.length > 0) {
      toStep(missingSteps[0], crn)
    }
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

  nextStep(session: AppointmentWizardSession, step: AppointmentWizardStep, crn: string): never {
    this.recordStep(session, step)
    const nextIndex = (steps.indexOf(step) + 1) % steps.length
    toStep(steps[nextIndex], crn)
  }

  firstStep(crn: string): never {
    toStep(firstStep, crn)
  }

  getBackPath(currentStep: AppointmentWizardStep, crn: string) {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex === 0) {
      return null
    }

    const previousIndex = (currentIndex - 1) % steps.length
    return getStepUrl(steps[previousIndex], crn)
  }
}
