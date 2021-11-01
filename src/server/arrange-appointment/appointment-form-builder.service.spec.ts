import { AppointmentFormBuilderService } from './appointment-form-builder.service'
import { AppointmentWizardStep } from './dto/AppointmentWizardViewModel'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { RedirectResponse } from '../common'
import { HttpStatus } from '@nestjs/common'
import { AppointmentTypeRequiresLocation } from '../community-api/client'
import { fakeOfficeLocation } from '../community-api/community-api.fake'
import { Test } from '@nestjs/testing'
import { MockLinksModule } from '../common/links/links.mock'

describe('AppointmentFormBuilderService', () => {
  let subject: AppointmentFormBuilderService
  const FIRST_STEP = AppointmentWizardStep.Type
  const SECOND_STEP = AppointmentWizardStep.Where
  const LAST_STEP = AppointmentWizardStep.Confirm

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [AppointmentFormBuilderService],
      imports: [MockLinksModule],
    }).compile()

    subject = module.get(AppointmentFormBuilderService)
  })

  function fakeSession(...completedSteps: AppointmentWizardStep[]): AppointmentWizardSession {
    return {
      crn: 'some-crn',
      completedSteps,
      dto: {
        requiresLocation: AppointmentTypeRequiresLocation.Required,
        availableLocations: [fakeOfficeLocation(), fakeOfficeLocation()],
      },
    }
  }

  function shouldRedirectToStep(observed: RedirectResponse, step: AppointmentWizardStep) {
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/NewAppointmentStep?crn=some-crn&step=${step}`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  }

  function shouldResetSession(session: AppointmentWizardSession) {
    expect(session).toEqual({
      crn: 'some-crn',
      dto: {},
      completedSteps: [],
    } as AppointmentWizardSession)
  }

  it('resets on first step when session is bad', () => {
    const session = {}
    const observed = subject.assertStep(session, FIRST_STEP, 'some-crn', 'get')
    expect(observed).toBeNull()
    shouldResetSession(session)
  })

  it('resets back to first step when session is bad', () => {
    const session = {}
    const observed = subject.assertStep(session, SECOND_STEP, 'some-crn', 'get')
    shouldRedirectToStep(observed, FIRST_STEP)
    shouldResetSession(session)
  })

  it('asserting first step', () => {
    const session = fakeSession()
    const observed = subject.assertStep(session, FIRST_STEP, 'some-crn', 'get')
    expect(observed).toBeNull()
  })

  it('asserting last step', () => {
    const completedSteps = Object.values(AppointmentWizardStep).filter(x => x !== LAST_STEP)
    const session = fakeSession(...completedSteps)
    const observed = subject.assertStep(session, LAST_STEP, 'some-crn', 'get')
    expect(observed).toBeNull()
  })

  it('asserting last step when first step not completed', () => {
    const session = fakeSession()
    const observed = subject.assertStep(session, LAST_STEP, 'some-crn', 'get')
    shouldRedirectToStep(observed, FIRST_STEP)
  })

  it('asserting first step when last step already completed', () => {
    const session = fakeSession(LAST_STEP)
    const observed = subject.assertStep(session, FIRST_STEP, 'some-crn', 'get')
    expect(observed).toBeNull()
  })

  it('asserting second step when last step already completed', () => {
    const session = fakeSession(LAST_STEP)
    const observed = subject.assertStep(session, SECOND_STEP, 'some-crn', 'get')
    shouldRedirectToStep(observed, FIRST_STEP)
  })

  it('next step when location required', () => {
    const session = fakeSession()
    const observed = subject.nextStep(session, AppointmentWizardStep.Type)
    shouldRedirectToStep(observed, AppointmentWizardStep.Where)
  })

  it('next step when location optional and locations available', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.Optional
    const observed = subject.nextStep(session, AppointmentWizardStep.Type)
    shouldRedirectToStep(observed, AppointmentWizardStep.Where)
  })

  it('next step when location optional and no locations available', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.Optional
    session.dto.availableLocations = []
    const observed = subject.nextStep(session, AppointmentWizardStep.Type)
    shouldRedirectToStep(observed, AppointmentWizardStep.When)
  })

  it('next step when location not required', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.NotRequired
    const observed = subject.nextStep(session, AppointmentWizardStep.Type)
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
    expect(observed).toBe(`/NewAppointmentStep?crn=some-crn&step=${FIRST_STEP}`)
  })
})
