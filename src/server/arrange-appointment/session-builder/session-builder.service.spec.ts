import { Test } from '@nestjs/testing'
import { SessionBuilderService } from './session-builder.service'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { ArrangeAppointmentService } from '../arrange-appointment.service'
import { AppointmentWizardSession } from '../dto/AppointmentWizardSession'
import { fakeSecurityContext } from '../../security/context/security-context.fake'
import {
  fakeAppointmentType,
  fakeConviction,
  fakeOffenderDetail,
  fakeOfficeLocation,
} from '../../community-api/community-api.fake'
import { fakeConvictionRequirementDetail } from '../../community-api/conviction/conviction.fake'
import { AppointmentBuilderDto, MESSAGES } from '../dto/AppointmentBuilderDto'
import { fakeAppointmentBuilderDto } from '../dto/arrange-appointment.fake'
import { WellKnownAppointmentType } from '../../config'
import { AppointmentTypeRequiresLocation } from '../../community-api/client'
import { FlatDeepPartial } from '../../app.types'
import {
  AppointmentBookingUnavailableReason,
  AppointmentWizardStep,
  NO_LOCATION,
  UNAVAILABLE_LOCATION,
} from '../dto/arrange-appointment.types'

describe('SessionBuilderService', () => {
  let subject: SessionBuilderService
  let service: SinonStubbedInstance<ArrangeAppointmentService>

  beforeAll(async () => {
    service = createStubInstance(ArrangeAppointmentService)
    const module = await Test.createTestingModule({
      providers: [SessionBuilderService, { provide: ArrangeAppointmentService, useValue: service }],
    }).compile()

    subject = module.get(SessionBuilderService)
  })

  function havingSession(dto: FlatDeepPartial<AppointmentBuilderDto> = {}): AppointmentWizardSession {
    return { crn: 'some-crn', dto, completedSteps: [] }
  }

  describe('init', () => {
    const offender = fakeOffenderDetail({
      offenderManagers: [
        { staff: { code: 'some-staff' }, team: { code: 'some-team' }, probationArea: { code: 'some-provider' } },
      ],
    })
    const conviction = fakeConviction({ convictionId: 100, sentence: { cja2003Order: true, legacyOrder: true } })
    const requirement = fakeConvictionRequirementDetail()

    beforeAll(() => {
      service.getOffenderDetails.withArgs('some-crn').resolves(offender)
      service.getConvictionAndRarRequirement.withArgs('some-crn').resolves({ conviction, requirement })
    })

    it('inits clean session', async () => {
      const session = havingSession()
      await subject.init(session, fakeSecurityContext({ staffCode: 'some-staff' }))

      expect(session.dto).toEqual({
        offender,
        staffCode: 'some-staff',
        teamCode: 'some-team',
        providerCode: 'some-provider',
        convictionId: 100,
        cja2003Order: true,
        legacyOrder: true,
      } as AppointmentBuilderDto)
    })

    it('fails to init when staff is not offender manager', async () => {
      const session = havingSession()
      await expect(subject.init(session, fakeSecurityContext({ staffCode: 'some-other-staff' }))).rejects.toThrow(Error)
    })
  })

  describe('type', () => {
    const model = fakeAppointmentBuilderDto()

    function havingType(partial: Parameters<typeof fakeAppointmentType>[0] = {}) {
      const type = fakeAppointmentType(partial)
      service.getAppointmentType
        .withArgs(model)
        .resolves(partial === null ? null : { ...type, wellKnownType: WellKnownAppointmentType.OfficeVisit })
      return type
    }

    it('fails if type does not exist', async () => {
      havingType(null)
      const session = havingSession()
      const observed = await subject.type(session, model)
      expect(observed).toEqual([{ property: 'type', constraints: { isAppointmentType: MESSAGES.type.required } }])
    })

    it('clears out location when location not required', async () => {
      havingType({ description: 'some type', requiresLocation: AppointmentTypeRequiresLocation.NotRequired })
      const session = havingSession({ location: 'some-location', locationDescription: 'some location-description' })

      const observed = await subject.type(session, model)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        typeDescription: 'some type',
        requiresLocation: AppointmentTypeRequiresLocation.NotRequired,
        alternateLocations: null,
        availableLocations: null,
        location: null,
        locationDescription: null,
      } as AppointmentBuilderDto)
    })

    it('sets available locations when location required', async () => {
      havingType({ description: 'some type', requiresLocation: AppointmentTypeRequiresLocation.Required })
      const session = havingSession({ teamCode: 'some-team' })

      const availableLocations = [fakeOfficeLocation()]
      service.getTeamOfficeLocations.withArgs('some-team').resolves(availableLocations)

      const observed = await subject.type(session, model)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        teamCode: 'some-team',
        typeDescription: 'some type',
        requiresLocation: AppointmentTypeRequiresLocation.Required,
        alternateLocations: [UNAVAILABLE_LOCATION],
        availableLocations,
        location: null,
        locationDescription: null,
      } as AppointmentBuilderDto)
    })

    it('sets available locations when location optional', async () => {
      havingType({ description: 'some type', requiresLocation: AppointmentTypeRequiresLocation.Optional })
      const session = havingSession({ teamCode: 'some-team' })

      const availableLocations = [fakeOfficeLocation()]
      service.getTeamOfficeLocations.withArgs('some-team').resolves(availableLocations)

      const observed = await subject.type(session, model)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        teamCode: 'some-team',
        typeDescription: 'some type',
        requiresLocation: AppointmentTypeRequiresLocation.Optional,
        alternateLocations: [UNAVAILABLE_LOCATION, NO_LOCATION],
        availableLocations,
        location: null,
        locationDescription: null,
      } as AppointmentBuilderDto)
    })
  })

  describe('where', () => {
    const availableLocations = [fakeOfficeLocation({ code: 'some-location', description: 'some-location-description' })]
    const alternateLocations = [UNAVAILABLE_LOCATION, NO_LOCATION]

    it('fails when location is not available', () => {
      const session = havingSession({ location: 'some-other-location', availableLocations, alternateLocations })
      const observed = subject.where(session)

      expect(observed).toEqual([{ property: 'location', constraints: { isLocation: MESSAGES.location.required } }])
    })

    it('succeeds when location is available', () => {
      const session = havingSession({ location: 'some-location', availableLocations, alternateLocations })
      const observed = subject.where(session)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        location: 'some-location',
        availableLocations,
        alternateLocations,
        locationDescription: 'some-location-description',
        unavailableReason: null,
      } as AppointmentBuilderDto)
    })

    it('succeeds when location is alternate', () => {
      const session = havingSession({ location: NO_LOCATION.code, availableLocations, alternateLocations })
      const observed = subject.where(session)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        location: NO_LOCATION.code,
        availableLocations,
        alternateLocations,
        locationDescription: NO_LOCATION.description,
        unavailableReason: null,
      } as AppointmentBuilderDto)
    })

    it('unavailable when location is unavailable', () => {
      const session = havingSession({ location: UNAVAILABLE_LOCATION.code, availableLocations, alternateLocations })
      const observed = subject.where(session)

      expect(observed).toEqual([])
      expect(session.dto).toEqual({
        location: UNAVAILABLE_LOCATION.code,
        availableLocations,
        alternateLocations,
        unavailableReason: AppointmentBookingUnavailableReason.NewLocationRequired,
      } as AppointmentBuilderDto)
    })
  })

  describe('add-notes', () => {
    it('does nothing when true', () => {
      const session = havingSession({ addNotes: true, notes: 'some-notes' })
      const observed = subject['add-notes'](session)
      expect(observed).toEqual([])
      expect(session.dto).toEqual({ addNotes: true, notes: 'some-notes' } as AppointmentBuilderDto)
    })

    it('removes existing notes when false', () => {
      const session = havingSession({ addNotes: false, notes: 'some-notes' })
      const observed = subject['add-notes'](session)
      expect(observed).toEqual([])
      expect(session.dto).toEqual({ addNotes: false, notes: null } as AppointmentBuilderDto)
    })
  })

  it('books the appointment on check', async () => {
    const session = havingSession()
    const model = fakeAppointmentBuilderDto()
    const stub = service.createAppointment.withArgs(model, 'some-crn')
    const observed = await subject.check(session, model)
    expect(observed).toEqual([])
    expect(stub.called).toBe(true)
  })

  for (const step of [
    AppointmentWizardStep.When,
    AppointmentWizardStep.Notes,
    AppointmentWizardStep.Sensitive,
    AppointmentWizardStep.Confirm,
    AppointmentWizardStep.Unavailable,
  ]) {
    it(`does nothing for ${step}`, () => {
      const observed = subject[step](null, null)
      expect(observed).toEqual([])
    })
  }
})
