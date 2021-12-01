import { Test } from '@nestjs/testing'
import { SessionBuilderService } from './session-builder.service'
import { RecordOutcomeService } from '../record-outcome.service'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { fakeSecurityContext } from '../../security/context/security-context.fake'
import { fakeOffenderDetail } from '../../community-api/community-api.fake'
import { fakeAvailableContactOutcomeTypes, fakeRecordOutcomeAppointmentSummary } from '../record-outcome.fake'
import { RecordOutcomeSession } from '../record-outcome.dto'
import { DateTime } from 'luxon'
import { RecordOutcomeUnavailableReason } from '../record-outcome.types'

describe('SessionBuilderService', () => {
  let subject: SessionBuilderService
  let service: SinonStubbedInstance<RecordOutcomeService>
  const security = fakeSecurityContext({ staffCode: 'some-staff' })

  beforeAll(async () => {
    service = createStubInstance(RecordOutcomeService)
    const module = await Test.createTestingModule({
      providers: [SessionBuilderService, { provide: RecordOutcomeService, useValue: service }],
    }).compile()

    subject = module.get(SessionBuilderService)
  })

  describe('init', () => {
    it('fails when user is not offender manager', async () => {
      const offender = fakeOffenderDetail({
        offenderManagers: [{ staff: { code: 'some-other-staff' } }],
      })
      service.getOffenderDetail.withArgs('some-crn').resolves(offender)

      const session = { crn: 'some-crn', dto: {}, breadcrumbOptions: { id: 10 } } as RecordOutcomeSession
      await expect(subject.init(session, security)).rejects.toThrow(
        "current user with staff code 'some-staff' is not an offender manager for offender with crn 'some-crn'",
      )
    })

    it('inits session', async () => {
      const offender = fakeOffenderDetail({
        firstName: 'Liz',
        surname: 'Haggis',
        offenderManagers: [{ staff: { code: 'some-staff' } }],
      })
      service.getOffenderDetail.withArgs('some-crn').resolves(offender)

      const appointment = fakeRecordOutcomeAppointmentSummary({
        id: 10,
        name: 'Some appointment',
        start: DateTime.fromISO('2021-11-10T12:00:00'),
        end: DateTime.fromISO('2021-11-10T13:00:00'),
        contactTypeCode: 'OFFICE',
      })
      service.getAppointmentDetail.withArgs('some-crn', 10).resolves(appointment)

      const availableOutcomeTypes = fakeAvailableContactOutcomeTypes()

      service.getAvailableContactOutcomes.withArgs('OFFICE').resolves(availableOutcomeTypes)

      const session = { crn: 'some-crn', dto: {}, breadcrumbOptions: { id: 10 } } as RecordOutcomeSession
      await subject.init(session, security)
      expect(session).toEqual({
        crn: 'some-crn',
        dto: {
          appointment: {
            id: 10,
            name: 'Some appointment',
            start: '2021-11-10T12:00:00.000+00:00',
            end: '2021-11-10T13:00:00.000+00:00',
            contactTypeCode: 'OFFICE',
          },
          offender,
          availableOutcomeTypes,
        },
        breadcrumbOptions: { id: 10, offenderName: 'Liz Haggis', entityName: 'Some appointment' },
      } as RecordOutcomeSession)
    })
  })

  describe('rar', () => {
    it('does nothing when isRar is false', () => {
      const session = { dto: { isRar: false } } as RecordOutcomeSession
      const observed = subject.rar(session)

      expect(observed).toEqual([])
      expect(session.dto.unavailableReason).toBeNull()
    })

    it('sets unavailable when isRar is true', () => {
      const session = { dto: { isRar: true } } as RecordOutcomeSession
      const observed = subject.rar(session)

      expect(observed).toEqual([])
      expect(session.dto.unavailableReason).toEqual(RecordOutcomeUnavailableReason.CountsTowardsRar)
    })
  })
})
