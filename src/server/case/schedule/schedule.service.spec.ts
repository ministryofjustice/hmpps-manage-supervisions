import { Test } from '@nestjs/testing'
import { ScheduleService } from './schedule.service'
import { AppointmentDetail } from '../../community-api/client'
import { CommunityApiService, ContactMappingService } from '../../community-api'
import { orderBy, sortBy } from 'lodash'
import { fakeAppointmentDetail } from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../config'
import { MockLinksModule } from '../../common/links/links.mock'
import { BreadcrumbType } from '../../common/links'

describe('ScheduleService', () => {
  let subject: ScheduleService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [ScheduleService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register(), MockLinksModule],
    }).compile()

    subject = module.get(ScheduleService)
    community = module.get(CommunityApiService)
  })

  it('gets offender appointments', async () => {
    const futureAppointments = 5
    const soonAppointments = 5
    const pastAppointments = 5
    const partial: DeepPartial<AppointmentDetail> = { appointmentId: 12345 }
    const appointments = orderBy(
      [
        ...[...Array(futureAppointments)].map(() => fakeAppointmentDetail(partial, { when: 'future' })),
        ...[...Array(soonAppointments)].map(() => fakeAppointmentDetail(partial, { when: 'soon' })),
        ...[...Array(pastAppointments)].map(() => fakeAppointmentDetail(partial, { when: 'past' })),
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
          link: MockLinksModule.of({ crn: 'some-crn', id: 12345 }).url(BreadcrumbType.Appointment),
          today: DateTime.now().toISODate() === DateTime.fromISO(x.appointmentStart).toISODate(),
        } as AppointmentListViewModel),
    )
    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(
      fakeOkResponse(
        appointments.filter(apt => DateTime.fromISO(apt.appointmentStart).toISODate() >= DateTime.now().toISODate()),
      ),
    )
    const observed = await subject.getScheduledAppointments('some-crn')
    expect(observed).toEqual(
      sortBy(expected.slice(0, futureAppointments + soonAppointments), [
        x => x.start.toJSDate(),
        x => x.end.toJSDate(),
      ]),
    )
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', from: DateTime.now().toISODate() })
  })

  it('gets appointment summary', async () => {
    const nextAppointment = fakeAppointmentDetail({ appointmentStart: '2100-10-03T12:30:00' })

    contactMapping.getTypeMeta.resolves({
      type: ContactTypeCategory.Appointment,
      value: { name: 'Some appointment', codes: { nonRar: 'SOME_CODE' } },
      name: 'some-appointment-type',
    })

    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(fakeOkResponse([nextAppointment]))
    const observed = await subject.getNextAppointment('some-crn')

    expect(observed).toEqual({
      name: 'some-appointment-type',
      date: DateTime.fromObject({ year: 2100, month: 10, day: 3, hour: 12, minute: 30 }),
    } as NextAppointmentSummary)

    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', from: DateTime.now().toISODate() })
  })
})
