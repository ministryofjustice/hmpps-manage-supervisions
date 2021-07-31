import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { DateTime, Settings } from 'luxon'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import * as faker from 'faker'
import {
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
} from '../../../community-api/client'
import { CommunityApiService, Paginated, ContactMappingService, AppointmentMetaResult } from '../../../community-api'
import { ContactTypeCategory } from '../../../config'
import { fakeAppointmentDetail, fakeContactSummary, fakePaginated } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { ActivityLogEntry, ActivityLogEntryTag, AppointmentActivityLogEntry } from './activity.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { fakeBreadcrumbUrl, MockLinksModule } from '../../../common/links/links.mock'
import { BreadcrumbType } from '../../../common/links'
import { merge } from 'lodash'

describe('ActivityService', () => {
  let subject: ActivityService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>
  const now = DateTime.now()

  beforeEach(async () => {
    Settings.now = () => now.valueOf()

    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [ActivityService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register(), MockLinksModule],
    }).compile()

    subject = module.get(ActivityService)
    community = module.get(CommunityApiService)
  })

  it('gets appointment', async () => {
    const appointment = fakeAppointmentDetail({
      appointmentId: 91747,
      appointmentStart: '2020-07-13T12:00:00',
      appointmentEnd: '2020-07-13T13:00:00',
      notes: 'Some appointment notes',
      sensitive: false,
      outcome: { complied: false, attended: true, description: 'Some outcome' },
      rarActivity: false,
      requirement: {
        requirementId: 84512,
        isActive: true,
        isRar: true,
      },
    })
    community.appointment.getOffenderAppointmentByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', appointmentId: 123 }))
      .resolves(fakeOkResponse(appointment))

    contactMapping.getTypeMeta.withArgs(appointment).returns(
      Promise.resolve({
        name: 'Some appointment with some staff member',
        type: ContactTypeCategory.Appointment,
        value: { name: 'Some appointment' },
      } as AppointmentMetaResult),
    )

    const observed = await subject.getAppointment('some-crn', 123)

    expect(observed).toEqual({
      id: 91747,
      category: 'Previous appointment',
      start: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 12 }),
      end: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 13 }),
      name: 'Some appointment with some staff member',
      notes: 'Some appointment notes',
      sensitive: false,
      tags: [
        {
          colour: 'red',
          name: 'failed to comply',
        },
      ],
      type: 'appointment',
      typeName: 'Some appointment',
      links: {
        addNotes: '/offender/some-crn/appointment/91747/add-notes',
        recordMissingAttendance: null,
        view: fakeBreadcrumbUrl(BreadcrumbType.Appointment, { crn: 'some-crn', id: 91747 }),
      },
      requirement: {
        requirementId: 84512,
        isActive: true,
        isRar: true,
      },
      outcome: { complied: false, attended: true, description: 'Some outcome' },
      rarActivity: false,
    } as AppointmentActivityLogEntry)
  })

  it('gets activity log page', async () => {
    const start = DateTime.fromJSDate(faker.date.past()).set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
    const end = start.plus({ hour: 1 })
    const contacts: ContactSummary[] = []

    function havingContact(
      partial: DeepPartial<ContactSummary> & { notes: string },
      type: ContactTypeCategory | null,
      meta: any = {},
    ) {
      const contact = fakeContactSummary(
        merge(
          {
            contactId: contacts.length + 1,
            contactStart: start.toISO(),
            contactEnd: end.toISO(),
            sensitive: false,
            outcome: {
              complied: true,
              attended: true,
              description: 'Some outcome',
            },
          },
          partial,
        ),
      )
      contacts.push(contact)
      contactMapping.getTypeMeta.withArgs(contact).returns(
        Promise.resolve({
          name: `some ${contact.notes}`,
          type,
          value: { ...meta, name: 'Some type' },
        }),
      )
    }

    havingContact(
      {
        notes: 'well known, complied RAR appointment',
        outcome: { complied: true, attended: true },
        rarActivity: true,
      },
      ContactTypeCategory.Appointment,
    )
    havingContact(
      {
        notes: 'well known, not complied sensitive appointment',
        outcome: { complied: false, attended: true },
        sensitive: true,
      },
      ContactTypeCategory.Appointment,
    )
    havingContact({ notes: 'other appointment, not recorded', outcome: null }, null, {
      appointment: true,
    })
    havingContact({ notes: 'well known communication' }, ContactTypeCategory.Communication)
    havingContact({ notes: 'unknown' }, null, { appointment: false })
    havingContact(
      {
        notes: 'well known, unacceptable absence appointment',
        outcome: { complied: false, attended: false },
      },
      ContactTypeCategory.Appointment,
    )
    havingContact(
      {
        notes: 'well known, acceptable absence appointment',
        outcome: { complied: true, attended: false },
      },
      ContactTypeCategory.Appointment,
    )

    const stub = community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
      fakeOkResponse(fakePaginated(contacts)),
    )

    const observed = await subject.getActivityLogPage('some-crn', { appointmentsOnly: true })

    function expectedAppointment(
      id: number,
      notes: string,
      tags: ActivityLogEntryTag[],
      {
        rarActivity = false,
        recorded = true,
        sensitive = false,
        outcome = { complied: true, attended: true },
      }: {
        rarActivity?: boolean
        recorded?: boolean
        sensitive?: boolean
        outcome?: { complied: boolean; attended: boolean }
      } = {},
    ): ActivityLogEntry {
      return {
        id,
        type: ContactTypeCategory.Appointment,
        name: `some ${notes}`,
        start,
        end,
        notes,
        tags,
        links: {
          view: fakeBreadcrumbUrl(BreadcrumbType.Appointment, { id, crn: 'some-crn' }),
          addNotes: `/offender/some-crn/appointment/${id}/add-notes`,
          recordMissingAttendance: recorded ? null : `/offender/some-crn/appointment/${id}/record-outcome`,
        },
        category: 'Previous appointment',
        sensitive,
        typeName: 'Some type',
        requirement: null,
        outcome: outcome
          ? {
              ...outcome,
              description: 'Some outcome',
            }
          : null,
        rarActivity,
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
        expectedAppointment(
          1,
          'well known, complied RAR appointment',
          [
            { colour: 'purple', name: 'rar' },
            { colour: 'green', name: 'complied' },
          ],
          { rarActivity: true, outcome: { complied: true, attended: true } },
        ),
        expectedAppointment(
          2,
          'well known, not complied sensitive appointment',
          [
            { colour: 'grey', name: 'sensitive' },
            { colour: 'red', name: 'failed to comply' },
          ],
          { sensitive: true, outcome: { complied: false, attended: true } },
        ),
        expectedAppointment(3, 'other appointment, not recorded', [], { recorded: false, outcome: null }),
        {
          id: 4,
          type: ContactTypeCategory.Communication,
          name: 'some well known communication',
          category: 'Other communication',
          sensitive: false,
          typeName: 'Some type',
          start,
          notes: 'well known communication',
          tags: [],
          links: {
            view: `/offender/some-crn/activity/communication/4`,
            addNotes: `/offender/some-crn/activity/communication/4/add-notes`,
          },
        },
        {
          id: 5,
          type: ContactTypeCategory.Other,
          name: 'some unknown',
          category: 'Unclassified contact',
          sensitive: false,
          typeName: 'Some type',
          start,
          notes: 'unknown',
          tags: [],
          links: null,
        },
        expectedAppointment(
          6,
          'well known, unacceptable absence appointment',
          [{ colour: 'red', name: 'unacceptable absence' }],
          { outcome: { complied: false, attended: false } },
        ),
        expectedAppointment(
          7,
          'well known, acceptable absence appointment',
          [{ colour: 'green', name: 'acceptable absence' }],
          { outcome: { complied: true, attended: false } },
        ),
      ],
    } as Paginated<ActivityLogEntry>)

    expect(stub.getCall(0).firstArg).toEqual({
      crn: 'some-crn',
      appointmentsOnly: true,
      to: now.toUTC().toISO(),
    } as ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest)
  })
})
