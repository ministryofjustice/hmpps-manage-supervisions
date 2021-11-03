import { Test } from '@nestjs/testing'
import { ActivityLogEntryService } from './activity-log-entry.service'
import { MockLinksModule } from '../../common/links/links.mock'
import { fakeActivityLogEntry, fakeContactSummary, fakeOffenderDetail } from '../../community-api/community-api.fake'
import { ContactTypeCategory } from '../../config'
import { DateTime } from 'luxon'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import {
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
  SystemActivityLogEntry,
  UnknownActivityLogEntry,
} from './activity.types'
import { fakeContactMeta } from '../../community-api/contact-mapping/contact-mapping.fake'

describe('ActivityLogEntryService', () => {
  let subject: ActivityLogEntryService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ActivityLogEntryService],
      imports: [MockLinksModule],
    }).compile()

    subject = module.get(ActivityLogEntryService)
  })

  it('gets well known appointment activity log entry from appointment detail', () => {
    const appointment = fakeContactSummary({
      contactId: 1,
      notes: 'some appointment notes',
      outcome: { complied: true, attended: true, description: 'some outcome' },
      officeLocation: { code: 'OFF1', description: 'Main Office' },
      contactStart: '2200-01-01T12:00:00',
      contactEnd: '2200-01-02T14:00:00',
      type: { nationalStandard: true },
      sensitive: true,
      rarActivityDetail: { type: { description: 'Some RAR type' }, subtype: { description: 'Some RAR subtype' } },
      enforcement: {
        enforcementAction: {
          description: 'Some enforcement action',
        },
      },
    })
    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    const observed = subject.getAppointmentActivityLogEntry('some-crn', appointment, meta)

    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      name: 'some appointment',
      type: ContactTypeCategory.Appointment,
      typeName: 'some appointment category',
      location: 'Main Office',
      notes: 'some appointment notes',
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'add-appointment-notes', content: { contactId: 1 } },
        }),
        recordMissingAttendance: null,
        updateOutcome: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'update-appointment-outcome', content: { contactId: 1 } },
        }),
      },
      start: DateTime.fromObject({ year: 2200, month: 1, day: 1, hour: 12 }),
      end: DateTime.fromObject({ year: 2200, month: 1, day: 2, hour: 14 }),
      category: 'Future appointment',
      isFuture: true,
      nationalStandard: true,
      enforcementAction: 'Some enforcement action',
      outcome: {
        attended: true,
        complied: true,
        description: 'some outcome',
        tag: { colour: 'green', name: 'complied' },
      },
      rarActivity: { name: 'Some RAR type: Some RAR subtype' },
      sensitive: true,
    } as AppointmentActivityLogEntry)
  })

  it('gets non well known appointment log entry from activity log entry', () => {
    const contact = {
      ...fakeActivityLogEntry({
        contactId: 1,
        notes: 'some appointment notes',
        type: { appointment: true, nationalStandard: false, description: 'some non well known appointment' },
        outcome: null,
        sensitive: false,
        enforcement: {
          enforcementAction: {
            code: 'WLS',
            description: 'Enforcement Letter Requested',
          },
        },
        rarActivity: { type: { description: 'Some RAR type' }, subtype: { description: 'Some RAR subtype' } },
        startTime: '12:00:00',
        endTime: '14:00:00',
      }),
      date: '2020-01-01',
    }
    const meta = fakeContactMeta(ContactTypeCategory.Appointment, false)
    const observed = subject.getAppointmentActivityLogEntry('some-crn', contact, meta)

    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      name: 'some appointment',
      type: ContactTypeCategory.Appointment,
      typeName: 'some non well known appointment',
      location: null,
      notes: 'some appointment notes',
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'add-appointment-notes', content: { contactId: 1 } },
        }),
        recordMissingAttendance: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.ActivityLog,
            campaign: 'create-appointment-outcome',
            content: { contactId: 1 },
          },
        }),
        updateOutcome: links.url(BreadcrumbType.ExitToDelius, {
          utm: { medium: UtmMedium.ActivityLog, campaign: 'update-appointment-outcome', content: { contactId: 1 } },
        }),
      },
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      end: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 14 }),
      category: 'Previous appointment',
      isFuture: false,
      nationalStandard: false,
      enforcementAction: 'Enforcement Letter Requested',
      outcome: null,
      rarActivity: { name: 'Some RAR type: Some RAR subtype' },
      sensitive: false,
    } as AppointmentActivityLogEntry)
  })

  it('gets well known communication activity log entry', () => {
    const contact = fakeContactSummary({
      contactId: 1,
      notes: 'some communication notes',
      type: { appointment: false },
      sensitive: true,
      contactStart: '2020-01-01T12:00:00',
      lastUpdatedDateTime: '2020-01-02T14:00:00',
      lastUpdatedByUser: { forenames: 'Jorge', surname: 'Swift' },
    })
    const offender = fakeOffenderDetail({
      firstName: 'Liz',
      middleNames: [],
      surname: 'Haggis',
    })

    const meta = fakeContactMeta(ContactTypeCategory.Communication)
    const observed = subject.getCommunicationActivityLogEntry('some-crn', contact, meta, offender)
    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      type: ContactTypeCategory.Communication,
      category: 'Other communication',
      isFuture: false,
      lastUpdatedBy: 'Jorge Swift',
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      lastUpdatedDateTime: DateTime.fromObject({ year: 2020, month: 1, day: 2, hour: 14 }),
      links: {
        view: links.url(BreadcrumbType.Communication),
        addNotes: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.ActivityLog,
            campaign: 'add-communication-notes',
            content: { contactId: 1 },
          },
        }),
      },
      name: 'some communication with Liz Haggis',
      from: 'from Liz Haggis',
      to: 'to Liz Haggis',
      notes: 'some communication notes',
      sensitive: true,
      typeName: 'some communication category',
    } as CommunicationActivityLogEntry)
  })

  it('gets non well known communication activity log entry', () => {
    const contact = fakeContactSummary({
      contactId: 1,
      notes: 'some communication notes',
      type: { appointment: false, description: 'some non well known communication' },
      sensitive: true,
      contactStart: '2020-01-01T12:00:00',
      lastUpdatedDateTime: '2020-01-02T14:00:00',
      lastUpdatedByUser: { forenames: 'Jorge', surname: 'Swift' },
    })
    const offender = fakeOffenderDetail({
      firstName: 'Liz',
      middleNames: [],
      surname: 'Haggis',
    })

    const meta = fakeContactMeta(ContactTypeCategory.Communication, false)
    const observed = subject.getCommunicationActivityLogEntry('some-crn', contact, meta, offender)
    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      type: ContactTypeCategory.Communication,
      category: 'Other communication',
      isFuture: false,
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      lastUpdatedBy: 'Jorge Swift',
      lastUpdatedDateTime: DateTime.fromObject({ year: 2020, month: 1, day: 2, hour: 14 }),
      links: {
        view: links.url(BreadcrumbType.Communication),
        addNotes: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.ActivityLog,
            campaign: 'add-communication-notes',
            content: { contactId: 1 },
          },
        }),
      },
      name: 'some communication',
      from: null,
      to: null,
      notes: 'some communication notes',
      sensitive: true,
      typeName: 'some non well known communication',
    } as CommunicationActivityLogEntry)
  })

  it('gets unknown activity log entry', () => {
    const contact = fakeContactSummary({
      contactId: 1,
      notes: 'some unknown contact notes',
      sensitive: true,
      contactStart: '2020-01-01T12:00:00',
      lastUpdatedDateTime: '2020-01-02T14:00:00',
      lastUpdatedByUser: { forenames: 'Jorge', surname: 'Swift' },
    })

    const meta = fakeContactMeta(ContactTypeCategory.Other)
    const observed = subject.getUnknownActivityLogEntry('some-crn', contact, meta)

    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      type: ContactTypeCategory.Other,
      category: 'Unclassified contact',
      typeName: null,
      isFuture: false,
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      lastUpdatedBy: 'Jorge Swift',
      lastUpdatedDateTime: DateTime.fromObject({ year: 2020, month: 1, day: 2, hour: 14 }),
      links: {
        view: links.url(BreadcrumbType.OtherActivityLogEntry),
        addNotes: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.ActivityLog,
            campaign: 'add-unknown-contact-notes',
            content: { contactId: 1 },
          },
        }),
      },
      name: 'some unknown contact',
      notes: 'some unknown contact notes',
      sensitive: true,
    } as UnknownActivityLogEntry)
  })

  it('gets system activity log entry', () => {
    const contact = fakeContactSummary({
      contactId: 1,
      notes: 'system contact notes',
      sensitive: true,
      contactStart: '2020-01-01T12:00:00',
    })

    const meta = fakeContactMeta(ContactTypeCategory.System)
    const observed = subject.getSystemActivityLogEntry('some-crn', contact, meta)

    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      type: ContactTypeCategory.System,
      category: 'System contact',
      isFuture: false,
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      links: {
        view: links.url(BreadcrumbType.ExitToDelius, {
          utm: {
            medium: UtmMedium.ActivityLog,
            campaign: 'view-system-generated-contact',
            content: { contactId: 1 },
          },
        }),
        addNotes: null,
      },
      name: 'some system contact',
      notes: 'system contact notes',
      sensitive: true,
    } as SystemActivityLogEntry)
  })
})
