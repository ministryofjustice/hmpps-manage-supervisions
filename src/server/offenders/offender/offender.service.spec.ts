import { Test } from '@nestjs/testing'
import * as faker from 'faker'
import { orderBy, sortBy } from 'lodash'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { MAX_RECENT_APPOINTMENTS, OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { AppointmentDetail, CommunityApiService, ContactSummary, Paginated } from '../../community-api'
import {
  fakeAddress,
  fakeAppointmentDetail,
  fakeContactSummary,
  fakeDisability,
  fakeOffenderDetail,
  fakePaginated,
  fakePhoneNumber,
} from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { ContactDetailsViewModel, PersonalDetailsViewModel, RecentAppointments } from './offender-view-model'
import { ContactMappingService } from '../../common'
import { WellKnownContactTypeCategory } from '../../config'
import { ActivityLogEntry, ActivityLogEntryTag } from './activity-log-entry'
import { DateTime } from 'luxon'

describe('OffenderService', () => {
  let subject: OffenderService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [OffenderService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(OffenderService)
    community = module.get(CommunityApiService)
  })

  it('gets offender detail', async () => {
    const offender = fakeOffenderDetail()
    const stub = community.offender.getOffenderDetailByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await subject.getOffenderDetail('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
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
      contactMapping.getTypeMeta.withArgs(apt).returns({
        type: null,
        value: { appointment: true },
        name: 'some-appointment-type',
      })
    }

    const expected = appointments.map(x => ({
      ...x,
      name: 'some-appointment-type',
      link: '/offender/some-crn/appointment/12345',
    }))
    const stub = community.appointment.getOffenderAppointmentsByCrnUsingGET.resolves(fakeOkResponse(appointments))
    const observed = await subject.getRecentAppointments('some-crn')
    expect(observed).toEqual({
      future: sortBy(expected.slice(0, futureAppointments), 'appointmentStart', 'appointmentEnd'),
      recent: expected.slice(futureAppointments, MAX_RECENT_APPOINTMENTS + futureAppointments),
      past: expected.slice(MAX_RECENT_APPOINTMENTS + futureAppointments),
    } as RecentAppointments)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets activity log page', async () => {
    const start = DateTime.fromJSDate(faker.date.past()).set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
    const end = start.plus({ hour: 1 })
    const contacts: ContactSummary[] = []

    function havingContact(
      partial: DeepPartial<ContactSummary> & { notes: string },
      type: WellKnownContactTypeCategory | null,
      meta: any = {},
    ) {
      const contact = fakeContactSummary({
        contactId: contacts.length + 1,
        contactStart: start.toISO(),
        contactEnd: end.toISO(),
        sensitive: false,
        ...partial,
      })
      contacts.push(contact)
      contactMapping.getTypeMeta.withArgs(contact).returns({
        name: `some ${contact.notes}`,
        type,
        value: meta,
      })
    }

    havingContact(
      {
        notes: 'well known, complied RAR appointment',
        outcome: { complied: true, attended: true },
        rarActivity: true,
        sensitive: false,
      },
      WellKnownContactTypeCategory.Appointment,
    )
    havingContact(
      {
        notes: 'well known, not complied sensitive appointment',
        outcome: { complied: false, attended: true },
        sensitive: true,
      },
      WellKnownContactTypeCategory.Appointment,
    )
    havingContact({ notes: 'other appointment, not recorded', outcome: null, sensitive: false }, null, {
      appointment: true,
    })
    havingContact({ notes: 'well known communication', sensitive: false }, WellKnownContactTypeCategory.Communication)
    havingContact({ notes: 'unknown', sensitive: false }, null, { appointment: false })
    havingContact(
      {
        notes: 'well known, unacceptable absence appointment',
        outcome: { complied: false, attended: false },
        sensitive: false,
      },
      WellKnownContactTypeCategory.Appointment,
    )
    havingContact(
      {
        notes: 'well known, acceptable absence appointment',
        outcome: { complied: true, attended: false },
        sensitive: false,
      },
      WellKnownContactTypeCategory.Appointment,
    )

    const stub = community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
      fakeOkResponse(fakePaginated(contacts)),
    )

    const observed = await subject.getActivityLogPage('some-crn', { appointmentsOnly: true })

    function expectedAppointment(
      id: number,
      notes: string,
      tags: ActivityLogEntryTag[],
      recorded = true,
    ): ActivityLogEntry {
      return {
        id,
        type: WellKnownContactTypeCategory.Appointment,
        name: `some ${notes}`,
        start,
        end,
        notes,
        tags,
        links: {
          view: `/offender/some-crn/appointment/${id}`,
          addNotes: `/offender/some-crn/appointment/${id}/add-notes`,
          recordMissingAttendance: recorded ? null : `/offender/some-crn/appointment/${id}/record-outcome`,
        },
      }
    }

    expect(observed).toEqual({
      totalPages: 1,
      first: true,
      last: false,
      number: 0,
      size: 7,
      totalElements: 7,
      content: [
        expectedAppointment(1, 'well known, complied RAR appointment', [
          { colour: 'purple', name: 'rar' },
          { colour: 'green', name: 'complied' },
        ]),
        expectedAppointment(2, 'well known, not complied sensitive appointment', [
          { colour: 'grey', name: 'sensitive' },
          { colour: 'red', name: 'failed to comply' },
        ]),
        expectedAppointment(3, 'other appointment, not recorded', [], false),
        {
          id: 4,
          type: WellKnownContactTypeCategory.Communication,
          name: 'some well known communication',
          start,
          notes: 'well known communication',
          tags: [],
          links: {
            view: `/offender/some-crn/communication/4`,
            addNotes: `/offender/some-crn/communication/4/add-notes`,
          },
        },
        {
          id: 5,
          type: null,
          name: 'some unknown',
          start,
          notes: 'unknown',
          tags: [],
          links: null,
        },
        expectedAppointment(6, 'well known, unacceptable absence appointment', [
          { colour: 'red', name: 'unacceptable absence' },
        ]),
        expectedAppointment(7, 'well known, acceptable absence appointment', [
          { colour: 'green', name: 'acceptable absence' },
        ]),
      ],
    } as Paginated<ActivityLogEntry>)

    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', appointmentsOnly: true })
  })

  it('gets offender personal details', () => {
    const offender = fakeOffenderDetail({
      firstName: 'Some',
      surname: 'Offender',
      dateOfBirth: '2001-05-06',
      contactDetails: {
        addresses: [
          fakeAddress({
            addressNumber: '123',
            buildingName: 'Some building',
            streetName: 'Some street',
            town: 'Some town',
            county: 'Some county',
            postcode: 'Some postcode',
            noFixedAbode: false,
            status: { code: 'M' },
          }),
        ],
        phoneNumbers: [fakePhoneNumber({ number: '0123456789' }), fakePhoneNumber({ number: '9876543210' })],
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
      },
      offenderAliases: [
        { firstName: 'A1', middleNames: ['A2'], surname: 'A3' },
        { firstName: 'B1', middleNames: ['B2'], surname: 'B3' },
      ],
      offenderProfile: {
        offenderLanguages: { primaryLanguage: 'English' },
        disabilities: [
          fakeDisability({ disabilityType: { description: 'Some disability' } }),
          fakeDisability({ disabilityType: { description: 'Some other disability' } }),
        ],
      },
    })
    const observed = subject.getPersonalDetails(offender)
    expect(observed).toEqual({
      contactDetails: {
        address: ['123 Some building Some street', 'Some town', 'Some county', 'Some postcode'],
        phoneNumbers: ['0123456789', '9876543210'],
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
      } as ContactDetailsViewModel,
      personalDetails: {
        name: 'Some Offender',
        preferredLanguage: 'English',
        dateOfBirth: DateTime.fromObject({ year: 2001, month: 5, day: 6 }),
        aliases: ['A1 A2 A3', 'B1 B2 B3'],
        disabilities: ['Some disability', 'Some other disability'],
      } as PersonalDetailsViewModel,
    })
  })
})
