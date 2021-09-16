import { Test } from '@nestjs/testing'
import { ActivityLogEntryService } from './activity-log-entry.service'
import { MockLinksModule } from '../../../common/links/links.mock'
import {
  fakeAppointmentDetail,
  fakeContactSummary,
  fakeOffenderDetail,
} from '../../../community-api/community-api.fake'
import { ContactTypeCategory } from '../../../config'
import { DateTime } from 'luxon'
import { BreadcrumbType } from '../../../common/links'
import { AppointmentActivityLogEntry, CommunicationActivityLogEntry, UnknownActivityLogEntry } from './activity.types'
import { fakeContactMeta } from '../../../community-api/contact-mapping/contact-mapping.fake'

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
    const appointment = fakeAppointmentDetail({
      appointmentId: 1,
      notes: 'some appointment notes',
      outcome: { complied: true, attended: true, description: 'some outcome' },
      appointmentStart: '2200-01-01T12:00:00',
      appointmentEnd: '2200-01-02T14:00:00',
      type: { nationalStandard: true },
      sensitive: true,
      rarActivity: true,
      requirement: {
        requirementId: 2,
        isActive: true,
        isRar: true,
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
      notes: 'some appointment notes',
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
        recordMissingAttendance: null,
        updateOutcome: links.url(BreadcrumbType.ExitToDelius),
      },
      start: DateTime.fromObject({ year: 2200, month: 1, day: 1, hour: 12 }),
      end: DateTime.fromObject({ year: 2200, month: 1, day: 2, hour: 14 }),
      category: 'Future appointment',
      isFuture: true,
      nationalStandard: true,
      outcome: {
        attended: true,
        complied: true,
        description: 'some outcome',
        tag: { colour: 'green', name: 'complied' },
      },
      rarActivity: true,
      requirement: {
        requirementId: 2,
        isActive: true,
        isRar: true,
      },
      sensitive: true,
    } as AppointmentActivityLogEntry)
  })

  it('gets non well known appointment log entry from contact summary', () => {
    const contact = fakeContactSummary({
      contactId: 1,
      notes: 'some appointment notes',
      type: { appointment: true, nationalStandard: false, description: 'some non well known appointment' },
      outcome: { complied: false, attended: true, description: 'some outcome' },
      sensitive: false,
      rarActivity: false,
      contactStart: '2020-01-01T12:00:00',
      contactEnd: '2020-01-02T14:00:00',
    })
    const meta = fakeContactMeta(ContactTypeCategory.Appointment, false)
    const observed = subject.getAppointmentActivityLogEntry('some-crn', contact, meta)

    const links = MockLinksModule.of({ id: 1, crn: 'some-crn' })
    expect(observed).toEqual({
      id: 1,
      name: 'some appointment',
      type: ContactTypeCategory.Appointment,
      typeName: 'some non well known appointment',
      notes: 'some appointment notes',
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
        recordMissingAttendance: null,
        updateOutcome: links.url(BreadcrumbType.ExitToDelius),
      },
      requirement: null,
      start: DateTime.fromObject({ year: 2020, month: 1, day: 1, hour: 12 }),
      end: DateTime.fromObject({ year: 2020, month: 1, day: 2, hour: 14 }),
      category: 'Previous appointment',
      isFuture: false,
      nationalStandard: false,
      outcome: {
        attended: true,
        complied: false,
        description: 'some outcome',
        tag: { colour: 'red', name: 'failed to comply' },
      },
      rarActivity: false,
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
        addNotes: links.url(BreadcrumbType.ExitToDelius),
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
        addNotes: links.url(BreadcrumbType.ExitToDelius),
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
        addNotes: links.url(BreadcrumbType.ExitToDelius),
      },
      name: 'some unknown contact',
      notes: 'some unknown contact notes',
      sensitive: true,
    } as UnknownActivityLogEntry)
  })
})
