import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { DateTime, Settings } from 'luxon'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import {
  ActivityLogEntry,
  AppointmentDetail,
  ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest,
  ContactSummary,
  OffenderDetail,
} from '../../community-api/client'
import { CommunityApiService, ContactMappingService, Paginated } from '../../community-api'
import { ContactTypeCategory } from '../../config'
import {
  fakeActivityLogEntry,
  fakeAppointmentDetail,
  fakeContactSummary,
  fakeOffenderDetail,
  fakePaginated,
} from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import {
  ActivityComplianceFilter,
  CaseActivityLogEntry,
  CaseActivityLogGroup,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
} from './activity.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { FakeConfigModule } from '../../config/config.fake'
import { BreachService } from '../../community-api/breach'
import { ActivityLogEntryService } from './activity-log-entry.service'
import { fakeContactMeta } from '../../community-api/contact-mapping/contact-mapping.fake'
import { fakeCaseActivityLogEntry } from './activity.fake'
import { ConvictionSummary } from '../sentence'
import { fakeConvictionSummary } from '../sentence/sentence.fake'

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
    contactMapping.getTypeMeta.withArgs(appointment).returns(meta)

    const entry = fakeCaseActivityLogEntry() as AppointmentActivityLogEntry
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
    contactMapping.getTypeMeta.withArgs(appointment).returns(meta)

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
    contactMapping.getTypeMeta.withArgs(contact).returns(meta)

    const entry = fakeCaseActivityLogEntry() as CommunicationActivityLogEntry
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
    contactMapping.getTypeMeta.withArgs(contact).returns(meta)

    await expect(() => subject.getCommunicationContact('some-crn', 123, offender)).rejects.toThrow(
      "contact with id '123' is not a communication",
    )
  })

  function havingAppointmentEntry(contact: ActivityLogEntry | AppointmentDetail) {
    const entry = fakeCaseActivityLogEntry({ type: ContactTypeCategory.Appointment })
    const meta = fakeContactMeta(ContactTypeCategory.Appointment)
    contactMapping.getTypeMeta.withArgs(contact).returns(meta)
    entryService.getAppointmentActivityLogEntry.withArgs('some-crn', match(contact), meta).returns(entry as any)
    return entry
  }

  function havingCommunicationEntry(contact: ActivityLogEntry | ContactSummary, offender: OffenderDetail) {
    const entry = fakeCaseActivityLogEntry({ type: ContactTypeCategory.Communication })
    const meta = fakeContactMeta(ContactTypeCategory.Communication)
    contactMapping.getTypeMeta.withArgs(contact).returns(meta)
    entryService.getCommunicationActivityLogEntry
      .withArgs('some-crn', match(contact), meta, offender)
      .returns(entry as any)
    return entry
  }

  function havingUnknownEntry(contact: ActivityLogEntry | ContactSummary) {
    const entry = fakeCaseActivityLogEntry({ type: ContactTypeCategory.Other })
    const meta = fakeContactMeta(ContactTypeCategory.Other)
    contactMapping.getTypeMeta.withArgs(contact).returns(meta)
    entryService.getUnknownActivityLogEntry.withArgs('some-crn', match(contact), meta).returns(entry as any)
    return entry
  }

  describe('activity log compliance filters', () => {
    let stub: ReturnType<typeof havingContacts>
    const offender = fakeOffenderDetail()
    const contacts = {
      appointment: fakeActivityLogEntry(),
      communication: fakeActivityLogEntry(),
      unknown: fakeActivityLogEntry(),
    }
    let entries: Record<keyof typeof contacts, CaseActivityLogEntry>
    let conviction: ConvictionSummary

    function havingContacts() {
      return community.contactAndAttendance.getActivityLogByCrnUsingGET.resolves(
        fakeOkResponse(
          fakePaginated([
            {
              date: '2021-03-01',
              rarDay: false,
              entries: [contacts.appointment, contacts.communication, contacts.unknown],
            },
          ]),
        ),
      )
    }

    function shouldHaveFilteredConvictionLevelContacts(
      expected: Omit<ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest, 'crn'>,
    ) {
      expect(stub.getCall(0).firstArg).toEqual({
        convictionId: 1234,
        crn: 'some-crn',
        contactDateFrom: '2019-03-01',
        contactDateTo: '2020-03-02',
        page: 0,
        pageSize: 1000,
        ...expected,
      } as ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest)
    }

    function shouldHaveFilteredOffenderLevelContacts(
      expected: Omit<ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest, 'crn'>,
    ) {
      expect(stub.getCall(0).firstArg).toEqual({
        convictionDatesOf: 1234,
        crn: 'some-crn',
        contactDateTo: '2020-03-02',
        page: 0,
        pageSize: 1000,
        ...expected,
      } as ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest)
    }

    function havingLastBreachEnd(value: DateTime | null) {
      breachService.getBreaches
        .withArgs('some-crn', 1234, match({ includeOutcome: false }))
        .resolves({ breaches: [], lastRecentBreachEnd: value })
    }

    beforeEach(() => {
      stub = havingContacts()
      entries = {
        appointment: havingAppointmentEntry(contacts.appointment),
        communication: havingCommunicationEntry(contacts.communication, offender),
        unknown: havingUnknownEntry(contacts.unknown),
      }
      conviction = fakeConvictionSummary({
        id: 1234,
        sentence: { startDate: DateTime.fromISO('2021-01-01'), endDate: DateTime.fromISO('2021-02-01') },
      })
    })

    it('maps entry groups', async () => {
      const observed = await subject.getActivityLogPage('some-crn', offender, { conviction: fakeConvictionSummary() })
      expect(observed).toEqual({
        content: [
          {
            date: DateTime.fromISO('2021-03-01'),
            isToday: false,
            entries: [entries.appointment, entries.communication, entries.unknown],
          },
        ],
        first: true,
        last: true,
        number: 0,
        size: 1,
        totalElements: 1,
        totalPages: 1,
      } as Paginated<CaseActivityLogGroup>)
    })

    it('does not apply any date from filters when not filtering for compliance', async () => {
      await subject.getActivityLogPage('some-crn', offender, { conviction })
      shouldHaveFilteredOffenderLevelContacts({ contactDateFrom: undefined })
    })

    it('gets unfiltered contacts & falls back to last 12 months when no breach', async () => {
      havingLastBreachEnd(null)
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.Appointments,
      })
      shouldHaveFilteredConvictionLevelContacts({ appointmentsOnly: true, nationalStandard: true })
    })

    it('filters appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.Appointments,
      })
      shouldHaveFilteredConvictionLevelContacts({ appointmentsOnly: true, nationalStandard: true })
    })

    it('filters complied appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.CompliedAppointments,
      })
      shouldHaveFilteredConvictionLevelContacts({
        appointmentsOnly: true,
        nationalStandard: true,
        attended: true,
        complied: true,
      })
    })

    it('filters acceptable absence appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.AcceptableAbsenceAppointments,
      })
      shouldHaveFilteredConvictionLevelContacts({
        appointmentsOnly: true,
        nationalStandard: true,
        attended: false,
        complied: true,
      })
    })

    it('filters failed to comply appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.FailedToComplyAppointments,
      })
      shouldHaveFilteredConvictionLevelContacts({ appointmentsOnly: true, nationalStandard: true, complied: false })
    })

    it('filters warning letter contacts', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.WarningLetters,
      })
      shouldHaveFilteredConvictionLevelContacts({
        contactTypes: ['AWLI', 'AWL2', 'AWLF', 'AWLS', 'C040', 'CLBR', 'CBRC', 'CLOB'],
      })
    })

    it('filters rar activity appointments', async () => {
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.RarActivity,
      })
      shouldHaveFilteredConvictionLevelContacts({ rarActivity: true })
    })

    it('filters appointments from last breach end', async () => {
      havingLastBreachEnd(DateTime.fromObject({ year: 2018, month: 5, day: 6 }))
      await subject.getActivityLogPage('some-crn', offender, {
        conviction,
        complianceFilter: ActivityComplianceFilter.Appointments,
      })
      shouldHaveFilteredConvictionLevelContacts({
        appointmentsOnly: true,
        nationalStandard: true,
        contactDateFrom: '2018-05-06',
      })
    })
  })
})
