import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { DateTime, Settings } from 'luxon'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import {
  AppointmentDetail,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
  OffenderDetail,
} from '../../../community-api/client'
import { CommunityApiService, ContactMappingService, Paginated } from '../../../community-api'
import { ContactTypeCategory } from '../../../config'
import {
  fakeAppointmentDetail,
  fakeContactSummary,
  fakeOffenderDetail,
  fakePaginated,
} from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import {
  ActivityComplianceFilter,
  ActivityLogEntry,
  ActivityLogEntryGroup,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
} from './activity.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { FakeConfigModule } from '../../../config/config.fake'
import { BreachService } from '../../../community-api/breach'
import { ActivityLogEntryService } from './activity-log-entry.service'
import { fakeContactMeta } from '../../../community-api/contact-mapping/contact-mapping.fake'
import { fakeActivityLogEntry } from './activity.fake'

describe('ActivityService', () => {
  let subject: ActivityService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>
  let breachService: SinonStubbedInstance<BreachService>
  let entryService: SinonStubbedInstance<ActivityLogEntryService>
  const now = DateTime.fromObject({ year: 2020, month: 3, day: 1 })

  beforeEach(async () => {
    Settings.now = () => now.valueOf()

    contactMapping = createStubInstance(ContactMappingService)
    breachService = createStubInstance(BreachService)
    entryService = createStubInstance(ActivityLogEntryService)

    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: ContactMappingService, useValue: contactMapping },
        { provide: BreachService, useValue: breachService },
        { provide: ActivityLogEntryService, useValue: entryService },
      ],
      imports: [MockCommunityApiModule.register(), FakeConfigModule.register()],
    }).compile()

    subject = module.get(ActivityService)
    community = module.get(CommunityApiService)
  })

  it('gets appointment', async () => {
    const appointment = fakeAppointmentDetail()

    community.appointment.getOffenderAppointmentByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', appointmentId: 123 }))
      .resolves(fakeOkResponse(appointment))

    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(appointment).resolves(meta)

    const entry = fakeActivityLogEntry() as AppointmentActivityLogEntry
    entryService.getAppointmentActivityLogEntry.withArgs('some-crn', appointment, meta).returns(entry)

    const observed = await subject.getAppointment('some-crn', 123)

    expect(observed).toBe(entry)
  })

  it('fails to map non-appointment contact to appointment', async () => {
    const appointment = fakeAppointmentDetail()

    community.appointment.getOffenderAppointmentByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', appointmentId: 123 }))
      .resolves(fakeOkResponse(appointment))

    const meta = fakeContactMeta(ContactTypeCategory.Communication)
    contactMapping.getTypeMeta.withArgs(appointment).resolves(meta)

    await expect(() => subject.getAppointment('some-crn', 123)).rejects.toThrow(
      "contact with id '123' is not an appointment",
    )
  })

  it('gets communication', async () => {
    const contact = fakeContactSummary()
    const offender = fakeOffenderDetail()

    community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', contactId: 123 }))
      .resolves(fakeOkResponse(contact))

    const meta = fakeContactMeta(ContactTypeCategory.Communication)
    contactMapping.getTypeMeta.withArgs(contact).resolves(meta)

    const entry = fakeActivityLogEntry() as CommunicationActivityLogEntry
    entryService.getCommunicationActivityLogEntry.withArgs('some-crn', contact, meta, offender).returns(entry)

    const observed = await subject.getCommunicationContact('some-crn', 123, offender)

    expect(observed).toBe(entry)
  })

  it('fails to map non-communication contact to a communication', async () => {
    const contact = fakeContactSummary()
    const offender = fakeOffenderDetail()

    community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', contactId: 123 }))
      .resolves(fakeOkResponse(contact))

    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(contact).resolves(meta)

    await expect(() => subject.getCommunicationContact('some-crn', 123, offender)).rejects.toThrow(
      "contact with id '123' is not a communication",
    )
  })

  function havingAppointmentEntry(contact: ContactSummary | AppointmentDetail) {
    const entry = fakeActivityLogEntry({ type: ContactTypeCategory.Appointment })
    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(contact).resolves(meta)
    entryService.getAppointmentActivityLogEntry.withArgs('some-crn', contact, meta).resolves(entry)
    return entry
  }

  function havingCommunicationEntry(contact: ContactSummary, offender: OffenderDetail) {
    const entry = fakeActivityLogEntry({ type: ContactTypeCategory.Communication })
    const meta = fakeContactMeta(ContactTypeCategory.Communication)
    contactMapping.getTypeMeta.withArgs(contact).resolves(meta)
    entryService.getCommunicationActivityLogEntry.withArgs('some-crn', contact, meta, offender).resolves(entry)
    return entry
  }

  function havingUnknownEntry(contact: ContactSummary) {
    const entry = fakeActivityLogEntry({ type: ContactTypeCategory.Other })
    const meta = fakeContactMeta(ContactTypeCategory.Other)
    contactMapping.getTypeMeta.withArgs(contact).resolves(meta)
    entryService.getUnknownActivityLogEntry.withArgs('some-crn', contact, meta).resolves(entry)
    return entry
  }

  describe('activity log compliance filters', () => {
    let stub: ReturnType<typeof havingContacts>
    const offender = fakeOffenderDetail()
    const appointment = fakeContactSummary()
    const communication = fakeContactSummary()
    const unknown = fakeContactSummary()
    let appointmentEntry: ActivityLogEntry
    let communicationEntry: ActivityLogEntry
    let unknownEntry: ActivityLogEntry

    function havingContacts() {
      return community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
        fakeOkResponse(fakePaginated([appointment, communication, unknown])),
      )
    }

    function shouldHaveFilteredContacts(
      expected: Omit<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest, 'crn'>,
    ) {
      expect(stub.getCall(0).firstArg).toEqual({
        crn: 'some-crn',
        contactDateFrom: '2019-03-01',
        contactDateTo: '2020-03-02',
        page: 1,
        pageSize: 999,
        ...expected,
      } as ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest)
    }

    function havingLastBreachEnd(value: DateTime | null) {
      breachService.getBreaches
        .withArgs('some-crn', 1, match({ includeOutcome: false }))
        .resolves({ breaches: [], lastRecentBreachEnd: value })
    }

    beforeEach(() => {
      stub = havingContacts()
      appointmentEntry = havingAppointmentEntry(appointment)
      communicationEntry = havingCommunicationEntry(communication, offender)
      unknownEntry = havingUnknownEntry(unknown)
    })

    it('maps & sorts entry groups', async () => {
      appointmentEntry.start = DateTime.fromISO('2020-02-01T12:00:00')
      unknownEntry.start = DateTime.fromISO('2020-02-01T13:00:00')
      communicationEntry.start = now
      const observed = await subject.getActivityLogPage('some-crn', offender, {})
      expect(observed).toEqual({
        content: [
          {
            date: now.startOf('day'),
            isToday: true,
            entries: [communicationEntry],
          },
          {
            date: DateTime.fromObject({ year: 2020, month: 2, day: 1 }),
            isToday: false,
            entries: [appointmentEntry, unknownEntry],
          },
        ],
        first: true,
        last: true,
        number: 0,
        size: 2,
        totalElements: 2,
        totalPages: 1,
      } as Paginated<ActivityLogEntryGroup>)
    })

    it('does not apply any date from filters when not filtering for compliance', async () => {
      await subject.getActivityLogPage('some-crn', offender, {})
      shouldHaveFilteredContacts({ contactDateFrom: undefined })
    })

    it('gets unfiltered contacts & falls back to last 12 months when no breach', async () => {
      havingLastBreachEnd(null)
      await subject.getActivityLogPage('some-crn', offender, {
        convictionId: 1,
        complianceFilter: ActivityComplianceFilter.Appointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, convictionId: 1 })
    })

    it('filters appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.Appointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true })
    })

    it('filters complied appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.CompliedAppointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, attended: true, complied: true })
    })

    it('filters acceptable absence appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.AcceptableAbsenceAppointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, attended: false, complied: true })
    })

    it('filters failed to comply appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.FailedToComplyAppointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, complied: false })
    })

    it('filters warning letter contacts', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.WarningLetters,
      })
      shouldHaveFilteredContacts({ contactTypes: ['AWLI', 'AWL2', 'AWLF', 'AWLS', 'C040', 'CLBR', 'CBRC', 'CLOB'] })
    })

    it('filters appointments from last breach end', async () => {
      havingLastBreachEnd(DateTime.fromObject({ year: 2018, month: 5, day: 6 }))
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.Appointments,
        convictionId: 1,
      })
      shouldHaveFilteredContacts({
        appointmentsOnly: true,
        nationalStandard: true,
        contactDateFrom: '2018-05-06',
        convictionId: 1,
      })
    })

    it('filters appointments from specified date', async () => {
      havingLastBreachEnd(DateTime.fromObject({ year: 2018, month: 5, day: 6 }))
      await subject.getActivityLogPage('some-crn', offender, {
        complianceFilter: ActivityComplianceFilter.Appointments,
        convictionId: 1,
        contactDateFrom: '2018-04-05',
      })
      shouldHaveFilteredContacts({
        appointmentsOnly: true,
        nationalStandard: true,
        contactDateFrom: '2018-04-05',
        convictionId: 1,
      })
    })
  })
})
