import { AppointmentWizardService } from './appointment-wizard.service'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import * as faker from 'faker'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { RedirectResponse } from '../common'
import { HttpStatus } from '@nestjs/common'

describe('AppointmentWizardService', () => {
  const subject = new AppointmentWizardService()
  const crn = faker.datatype.uuid()
  const FIRST_STEP = AppointmentWizardStep.AppointmentType
  const SECOND_STEP = AppointmentWizardStep.Check
  const LAST_STEP = AppointmentWizardStep.Confirm

  it('asserting first step', () => {
    const observed = subject.assertStep({ completedSteps: [] }, FIRST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting last step', () => {
    const completedSteps = Object.values(AppointmentWizardStep).filter(x => x !== LAST_STEP)
    const observed = subject.assertStep({ completedSteps }, LAST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting last step when first step not completed', () => {
    const observed = subject.assertStep({ completedSteps: [] }, LAST_STEP, crn)
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/arrange-appointment/${crn}/${FIRST_STEP}`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  })

  it('asserting first step when last step already completed', () => {
    const observed = subject.assertStep({ completedSteps: [LAST_STEP] }, FIRST_STEP, crn)
    expect(observed).toBeNull()
  })

  it('asserting second step when last step already completed', () => {
    const observed = subject.assertStep({ completedSteps: [LAST_STEP] }, SECOND_STEP, crn)
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/arrange-appointment/${crn}/${FIRST_STEP}`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  })

  it('recording step', () => {
    const session: AppointmentWizardSession = { completedSteps: [FIRST_STEP] }
    subject.recordStep(session, SECOND_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP, SECOND_STEP])
  })

  it('recording first step with empty session', () => {
    const session: AppointmentWizardSession = {}
    subject.recordStep(session, FIRST_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP])
  })

  it('recording duplicate step', () => {
    const session: AppointmentWizardSession = { completedSteps: [FIRST_STEP] }
    subject.recordStep(session, FIRST_STEP)
    expect(session.completedSteps).toEqual([FIRST_STEP])
  })

  it('next step', () => {
    const session: AppointmentWizardSession = {}
    const observed = subject.nextStep(session, FIRST_STEP, crn)
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/arrange-appointment/${crn}/${SECOND_STEP}`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  })
})
