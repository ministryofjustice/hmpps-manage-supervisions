import { Test } from '@nestjs/testing'
import { MAX_RECENT_APPOINTMENTS, ScheduleService } from './schedule.service'
import { AppointmentDetail } from '../../../community-api/client'
import { CommunityApiService, ContactMappingService } from '../../../community-api'
import { orderBy, sortBy } from 'lodash'
import { fakeAppointmentDetail } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { AppointmentListViewModel, AppointmentSummary, RecentAppointments } from './schedule.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../../config'

describe('ScheduleService', () => {
  let subject: ScheduleService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [ScheduleService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(ScheduleService)
    community = module.get(CommunityApiService)
  })

  it('gets offender appointments', async () => {
    const futureAppointments = 5
    const partial: DeepPartial<AppointmentDetail> = { appointmentId: 12345 }
    const appointments = orderBy(
      [
        ...[...Array(futureAppointments)].map(() => fakeAppointmentDetail(partial, { when: 'future' })),
        ...[...Array(MAX_RECENT_APPOINTMENTS)].map(() => fakeAppointmentDetail(partial, { when: 'recent' })),
        fakeAppointmentDetail(partial, { when: 'past' }),
      ],
      'appointmentStart',
      'desc',
    )

    for (const apt of appointments) {
      contactMapping.getTypeMeta.withArgs(apt).resolves({
        type: ContactTypeCategory.Appointment,
        value: { name: 'Some appointment', codes: { nonRar: 'SOME_CODE' } },
        name: 'some-appointment-type',
      })
    }

    const expected = appointments.map(
      x =>
        ({
          start: DateTime.fromISO(x.appointmentStart),
          end: DateTime.fromISO(x.appointmentEnd),
          name: 'some-appointment-type',
          link: '/offender/some-crn/appointment/12345',
        } as AppointmentListViewModel),
    )
    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(fakeOkResponse(appointments))
    const observed = await subject.getRecentAppointments('some-crn')
    expect(observed).toEqual({
      future: sortBy(expected.slice(0, futureAppointments), [x => x.start.toJSDate(), x => x.end.toJSDate()]),
      recent: expected.slice(futureAppointments, MAX_RECENT_APPOINTMENTS + futureAppointments),
      past: expected.slice(MAX_RECENT_APPOINTMENTS + futureAppointments),
    } as RecentAppointments)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets appointment summary', async () => {
    const appointments = [
      fakeAppointmentDetail({}, { when: 'future' }),
      fakeAppointmentDetail({ outcome: { complied: false } }),
      fakeAppointmentDetail({ outcome: { complied: true, attended: false } }),
      fakeAppointmentDetail({ outcome: { complied: true, attended: true } }),
    ]

    for (const apt of appointments) {
      contactMapping.getTypeMeta.withArgs(apt).resolves({
        type: ContactTypeCategory.Appointment,
        value: { name: 'Some appointment', codes: { nonRar: 'SOME_CODE' } },
        name: 'some-appointment-type',
      })
    }

    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(fakeOkResponse(appointments))
    const observed = await subject.getAppointmentSummary('some-crn')

    expect(observed).toEqual({
      next: {
        name: 'some-appointment-type',
        date: DateTime.fromISO(appointments[0].appointmentStart),
      },
      attendance: {
        acceptableAbsence: 1,
        failureToComply: 1,
        complied: 1,
      },
    } as AppointmentSummary)

    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })
})
