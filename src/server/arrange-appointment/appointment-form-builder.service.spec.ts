import { AppointmentFormBuilderService } from './appointment-form-builder.service'
import { AppointmentWizardSession } from './dto/AppointmentWizardSession'
import { RedirectResponse } from '../common/dynamic-routing'
import { HttpStatus, NotFoundException } from '@nestjs/common'
import { AppointmentTypeRequiresLocation } from '../community-api/client'
import { fakeOfficeLocation } from '../community-api/community-api.fake'
import { Test } from '@nestjs/testing'
import { MockLinksModule } from '../common/links/links.mock'
import { AppointmentBookingUnavailableReason, AppointmentWizardStep } from './dto/arrange-appointment.types'

describe('AppointmentFormBuilderService', () => {
  let subject: AppointmentFormBuilderService
  const FIRST_STEP = AppointmentWizardStep.Type
  const SECOND_STEP = AppointmentWizardStep.Rar
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
        isRar: false,
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

  function shouldRedirectToReset(observed: RedirectResponse) {
    expect(observed).toBeInstanceOf(RedirectResponse)
    expect(observed.url).toBe(`/NewAppointment?crn=some-crn`)
    expect(observed.statusCode).toBe(HttpStatus.FOUND)
  }

  it('resets to first step', () => {
    const session = {}
    const observed = subject.resetToFirstStep(session, 'some-crn')
    expect(session).toEqual({
      crn: 'some-crn',
      dto: {},
      completedSteps: [],
      isComplete: false,
    } as AppointmentWizardSession)
    shouldRedirectToStep(observed, FIRST_STEP)
  })

  it('resets on first step when session is bad', () => {
    const session = {}
    const observed = subject.assertStep(session, FIRST_STEP, 'some-crn', 'get')
    shouldRedirectToReset(observed)
  })

  it('resets on any other step when session is bad', () => {
    const session = {}
    const observed = subject.assertStep(session, SECOND_STEP, 'some-crn', 'get')
    shouldRedirectToReset(observed)
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

  it('asserting step when update not supported', () => {
    const session = fakeSession()
    expect(() => subject.assertStep(session, LAST_STEP, 'some-crn', 'post')).toThrow(NotFoundException)
  })

  it('asserting second step when first step not completed', () => {
    const session = fakeSession()
    const observed = subject.assertStep(session, SECOND_STEP, 'some-crn', 'get')
    shouldRedirectToStep(observed, FIRST_STEP)
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
    const observed = subject.nextStep(session, AppointmentWizardStep.Rar)
    shouldRedirectToStep(observed, AppointmentWizardStep.Where)
  })

  it('next step when location optional and locations available', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.Optional
    const observed = subject.nextStep(session, AppointmentWizardStep.Rar)
    shouldRedirectToStep(observed, AppointmentWizardStep.Where)
  })

  it('next step when location optional and no locations available', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.Optional
    session.dto.availableLocations = []
    const observed = subject.nextStep(session, AppointmentWizardStep.Rar)
    shouldRedirectToStep(observed, AppointmentWizardStep.When)
  })

  it('next step when location not required', () => {
    const session = fakeSession()
    session.dto.requiresLocation = AppointmentTypeRequiresLocation.NotRequired
    const observed = subject.nextStep(session, AppointmentWizardStep.Rar)
    shouldRedirectToStep(observed, AppointmentWizardStep.When)
  })

  it('redirects to location unavailable when reason given', () => {
    const session = fakeSession()
    session.dto.unavailableReason = AppointmentBookingUnavailableReason.NewLocationRequired
    const observed = subject.nextStep(session, AppointmentWizardStep.Where)
    shouldRedirectToStep(observed, AppointmentWizardStep.Unavailable)
  })

  it('redirects to rar unavailable when reason given', () => {
    const session = fakeSession()
    session.dto.unavailableReason = AppointmentBookingUnavailableReason.CountsTowardsRar
    const observed = subject.nextStep(session, AppointmentWizardStep.Rar)
    shouldRedirectToStep(observed, AppointmentWizardStep.Unavailable)
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
