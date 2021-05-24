import { AppointmentWizardService } from './appointment-wizard.service'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import * as faker from 'faker'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { RedirectResponse } from '../common'
import { HttpStatus } from '@nestjs/common'
import { AppointmentTypeRequiresLocation } from '../community-api'

describe('AppointmentWizardService', () => {
  const subject = new AppointmentWizardService()
  const crn = faker.datatype.uuid()
  const FIRST_STEP = AppointmentWizardStep.Type
  const SECOND_STEP = AppointmentWizardStep.Where
  const LAST_STEP = AppointmentWizardStep.Confirm

  function fakeSession(...completedSteps: AppointmentWizardStep[]): AppointmentWizardSession {
    return {
      crn,
      completedSteps,
      appointment: {
        requiresLocation: AppointmentTypeRequiresLocation.Required,
      },
    }
  }

  function shouldRedirectToStep(observed: RedirectResponse, step: AppointmentWizardStep) {
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/arrange-appointment/${crn}/${step}`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  }

  it('asserting first step', () => {
    const session = fakeSession()
    const observed = subject.assertStep(session, FIRST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting last step', () => {
    const completedSteps = Object.values(AppointmentWizardStep).filter(x => x !== LAST_STEP)
    const session = fakeSession(...completedSteps)
    const observed = subject.assertStep(session, LAST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting last step when first step not completed', () => {
    const session = fakeSession()
    const observed = subject.assertStep(session, LAST_STEP, crn)
    shouldRedirectToStep(observed, FIRST_STEP)
  })

  it('asserting first step when last step already completed', () => {
    const session = fakeSession(LAST_STEP)
    const observed = subject.assertStep(session, FIRST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting second step when last step already completed', () => {
    const session = fakeSession(LAST_STEP)
    const observed = subject.assertStep(session, SECOND_STEP, crn)
    shouldRedirectToStep(observed, FIRST_STEP)
  })

  it('recording step', () => {
    const session = fakeSession(FIRST_STEP)
    subject.recordStep(session, SECOND_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP, SECOND_STEP])
  })

  it('recording first step with empty session', () => {
    const session = fakeSession()
    subject.recordStep(session, FIRST_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP])
  })

  it('recording duplicate step', () => {
    const session = fakeSession(FIRST_STEP)
    subject.recordStep(session, FIRST_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP])
  })

  it('next step when location required', () => {
    const session = fakeSession()
    const observed = subject.nextStep(session, FIRST_STEP)
    shouldRedirectToStep(observed, SECOND_STEP)
  })

  it('next step when location optional', () => {
    const session = fakeSession()
    session.appointment.requiresLocation = AppointmentTypeRequiresLocation.Optional
    const observed = subject.nextStep(session, FIRST_STEP)
    shouldRedirectToStep(observed, SECOND_STEP)
  })

  it('next step when location not required', () => {
    const session = fakeSession()
    session.appointment.requiresLocation = AppointmentTypeRequiresLocation.NotRequired
    const observed = subject.nextStep(session, FIRST_STEP)
    shouldRedirectToStep(observed, AppointmentWizardStep.When)
  })

  it('getting back url on first step', () => {
    const session = fakeSession()
    const observed = subject.getBackUrl(session, FIRST_STEP)
    expect(observed).toBeNull()
  })

  it('getting back url on second step', () => {
    const session = fakeSession()
    const observed = subject.getBackUrl(session, SECOND_STEP)
    expect(observed).toBe(`/arrange-appointment/${crn}/${FIRST_STEP}`)
  })
})
