import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { DateTime } from 'luxon'
import * as faker from 'faker'
import { CommunityApiService, ContactSummary, Paginated } from '../../../community-api'
import { WellKnownContactTypeCategory } from '../../../config'
import { fakeContactSummary, fakePaginated } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import { ActivityLogEntry, ActivityLogEntryTag } from './activity.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { ContactMappingService } from '../../../common'

describe('ActivityService', () => {
  let subject: ActivityService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>

  beforeEach(async () => {
    contactMapping = createStubInstance(ContactMappingService)

    const module = await Test.createTestingModule({
      providers: [ActivityService, { provide: ContactMappingService, useValue: contactMapping }],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(ActivityService)
    community = module.get(CommunityApiService)
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
})
