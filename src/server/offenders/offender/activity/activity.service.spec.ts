import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { DateTime, Settings } from 'luxon'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import {
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
} from '../../../community-api/client'
import {
  AppointmentMetaResult,
  CommunicationMetaResult,
  CommunityApiService,
  ContactMappingService,
  Paginated,
} from '../../../community-api'
import { ContactTypeCategory } from '../../../config'
import { fakeAppointmentDetail, fakeContactSummary, fakePaginated } from '../../../community-api/community-api.fake'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
import {
  ActivityFilter,
  ActivityLogEntry,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
  UnknownActivityLogEntry,
} from './activity.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { fakeBreadcrumbUrl, MockLinksModule } from '../../../common/links/links.mock'
import { BreadcrumbType } from '../../../common/links'
import { merge } from 'lodash'
import { FakeConfigModule } from '../../../config/config.fake'
import { BreachService } from '../../../community-api/breach'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

describe('ActivityService', () => {
  let subject: ActivityService
  let community: MockCommunityApiService
  let contactMapping: SinonStubbedInstance<ContactMappingService>
  let breachService: SinonStubbedInstance<BreachService>
  const now = DateTime.fromObject({ year: 2020, month: 3, day: 1 })

  beforeEach(async () => {
    Settings.now = () => now.valueOf()

    contactMapping = createStubInstance(ContactMappingService)
    breachService = createStubInstance(BreachService)

    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: ContactMappingService, useValue: contactMapping },
        { provide: BreachService, useValue: breachService },
      ],
      imports: [MockCommunityApiModule.register(), MockLinksModule, FakeConfigModule.register()],
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
      category: 'Future appointment',
      start: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 12 }),
      end: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 13 }),
      name: 'Some appointment with some staff member',
      notes: 'Some appointment notes',
      sensitive: false,
      tags: [
        {
          colour: GovUkUiTagColour.Red,
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

  describe('activity log filters', () => {
    let stub: ReturnType<typeof havingContacts>

    function havingContacts() {
      return community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
        fakeOkResponse(fakePaginated([])),
      )
    }

    function shouldHaveFilteredContacts(
      expected: Omit<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest, 'crn'>,
    ) {
      expect(stub.getCall(0).firstArg).toEqual({
        crn: 'some-crn',
        contactDateFrom: '2019-03-01',
        contactDateTo: '2020-03-02',
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
    })

    it('gets unfiltered contacts & falls back to last 12 months when no breach', async () => {
      havingLastBreachEnd(null)
      await subject.getActivityLogPage('some-crn', 'some offender', { convictionId: 1 })
      shouldHaveFilteredContacts({ convictionId: 1 })
    })

    it('filters appointments', async () => {
      await subject.getActivityLogPage('some-crn', 'some offender', { filter: ActivityFilter.Appointments })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true })
    })

    it('filters complied appointments', async () => {
      await subject.getActivityLogPage('some-crn', 'some offender', { filter: ActivityFilter.CompliedAppointments })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, attended: true, complied: true })
    })

    it('filters acceptable absence appointments', async () => {
      await subject.getActivityLogPage('some-crn', 'some offender', {
        filter: ActivityFilter.AcceptableAbsenceAppointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, attended: false, complied: true })
    })

    it('filters failed to comply appointments', async () => {
      await subject.getActivityLogPage('some-crn', 'some offender', {
        filter: ActivityFilter.FailedToComplyAppointments,
      })
      shouldHaveFilteredContacts({ appointmentsOnly: true, nationalStandard: true, complied: false })
    })

    it('filters warning letter contacts', async () => {
      await subject.getActivityLogPage('some-crn', 'some offender', { filter: ActivityFilter.WarningLetters })
      shouldHaveFilteredContacts({ contactTypes: ['AWLI', 'AWL2', 'AWLF', 'AWLS', 'C040', 'CLBR', 'CBRC', 'CLOB'] })
    })

    it('filters appointments from last breach end', async () => {
      havingLastBreachEnd(DateTime.fromObject({ year: 2018, month: 5, day: 6 }))
      await subject.getActivityLogPage('some-crn', 'some offender', {
        filter: ActivityFilter.Appointments,
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
      await subject.getActivityLogPage('some-crn', 'some offender', {
        filter: ActivityFilter.Appointments,
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

  describe('activity log page', () => {
    function havingContacts(
      ...partials: (DeepPartial<ContactSummary> & { notes: string; type: ContactTypeCategory | null; meta?: any })[]
    ) {
      const contacts = partials.map(({ type, meta, ...partial }, i) => {
        const contact = fakeContactSummary([
          {
            contactStart: '2018-01-01T12:00:00',
            contactEnd: '2018-01-01T13:00:00',
            contactId: i + 1,
            sensitive: false,
            outcome: {
              complied: true,
              attended: true,
              description: 'Some outcome',
            },
            lastUpdatedByUser: { forenames: 'Some', surname: 'User' },
            lastUpdatedDateTime: '2018-04-01T12:00:00',
          },
          partial,
        ])
        contactMapping.getTypeMeta.withArgs(contact).resolves({
          name: `some ${contact.notes}`,
          type: type,
          value: { ...meta, name: 'Some type' },
        })
        return contact
      })

      community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET.resolves(
        fakeOkResponse(fakePaginated(contacts)),
      )
    }

    function shouldReturnAppointment(
      observed: Paginated<ActivityLogEntry>,
      expected: DeepPartial<AppointmentActivityLogEntry>,
    ) {
      expect(observed.content).toEqual([
        merge(
          {
            id: 1,
            type: ContactTypeCategory.Appointment,
            category: 'Previous appointment',
            start: DateTime.fromObject({ year: 2018, month: 1, day: 1, hour: 12 }),
            end: DateTime.fromObject({ year: 2018, month: 1, day: 1, hour: 13 }),
            links: {
              addNotes: '/offender/some-crn/appointment/1/add-notes',
              recordMissingAttendance: null,
              view: fakeBreadcrumbUrl(BreadcrumbType.Appointment, { crn: 'some-crn', id: 1 }),
            },
            name: `some ${expected.notes}`,
            outcome: {
              attended: true,
              complied: true,
              description: 'Some outcome',
            },
            rarActivity: false,
            requirement: null,
            sensitive: false,
            tags: [],
            typeName: 'Some type',
          } as ActivityLogEntry,
          expected,
        ),
      ])
    }

    function shouldReturnCommunication(
      observed: Paginated<ActivityLogEntry>,
      expected: DeepPartial<CommunicationActivityLogEntry>,
    ) {
      expect(observed.content).toEqual([
        merge(
          {
            id: 1,
            type: ContactTypeCategory.Communication,
            category: 'Other communication',
            start: DateTime.fromObject({ year: 2018, month: 1, day: 1, hour: 12 }),
            links: {
              addNotes: '/offender/some-crn/activity/communication/1/add-notes',
              view: '/offender/some-crn/activity/communication/1',
            },
            name: `some ${expected.notes}`,
            sensitive: false,
            tags: [],
            typeName: 'Some type',
            lastUpdatedBy: 'Some User',
            lastUpdatedDateTime: DateTime.fromObject({ year: 2018, month: 4, day: 1, hour: 12 }),
          } as ActivityLogEntry,
          expected,
        ),
      ])
    }

    function shouldReturnUnknown(
      observed: Paginated<ActivityLogEntry>,
      expected: DeepPartial<UnknownActivityLogEntry>,
    ) {
      expect(observed.content).toEqual([
        merge(
          {
            id: 1,
            type: ContactTypeCategory.Other,
            category: 'Unclassified contact',
            start: DateTime.fromObject({ year: 2018, month: 1, day: 1, hour: 12 }),
            links: null,
            name: `some ${expected.notes}`,
            sensitive: false,
            tags: [],
            typeName: 'Some type',
          } as ActivityLogEntry,
          expected,
        ),
      ])
    }

    it('gets well known, complied RAR appointment', async () => {
      havingContacts({
        type: ContactTypeCategory.Appointment,
        notes: 'well known, complied RAR appointment',
        outcome: { complied: true, attended: true },
        rarActivity: true,
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnAppointment(observed, {
        notes: 'well known, complied RAR appointment',
        rarActivity: true,
        tags: [
          { colour: GovUkUiTagColour.Purple, name: 'rar' },
          { colour: GovUkUiTagColour.Green, name: 'complied' },
        ],
      })
    })

    it('gets well known, not complied sensitive appointment', async () => {
      havingContacts({
        type: ContactTypeCategory.Appointment,
        notes: 'well known, not complied sensitive appointment',
        outcome: { complied: false, attended: true },
        sensitive: true,
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnAppointment(observed, {
        notes: 'well known, not complied sensitive appointment',
        outcome: { complied: false },
        sensitive: true,
        tags: [
          { colour: GovUkUiTagColour.Grey, name: 'sensitive' },
          { colour: GovUkUiTagColour.Red, name: 'failed to comply' },
        ],
      })
    })

    it('gets well known, unacceptable absence appointment', async () => {
      havingContacts({
        type: ContactTypeCategory.Appointment,
        notes: 'well known, unacceptable absence appointment',
        outcome: { complied: false, attended: false },
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnAppointment(observed, {
        notes: 'well known, unacceptable absence appointment',
        outcome: { attended: false, complied: false },
        tags: [{ colour: GovUkUiTagColour.Red, name: 'unacceptable absence' }],
      })
    })

    it('gets well known, acceptable absence appointment', async () => {
      havingContacts({
        type: ContactTypeCategory.Appointment,
        notes: 'well known, acceptable absence appointment',
        outcome: { complied: true, attended: false },
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnAppointment(observed, {
        notes: 'well known, acceptable absence appointment',
        outcome: { attended: false, complied: true },
        tags: [{ colour: GovUkUiTagColour.Green, name: 'acceptable absence' }],
      })
    })

    it('gets other appointment, not recorded', async () => {
      havingContacts({
        type: ContactTypeCategory.Appointment,
        notes: 'other appointment, not recorded',
        outcome: null,
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnAppointment(observed, {
        notes: 'other appointment, not recorded',
        links: {
          recordMissingAttendance: '/offender/some-crn/appointment/1/record-outcome',
        },
        outcome: null,
      })
    })

    it('gets well known communication', async () => {
      havingContacts({
        type: ContactTypeCategory.Communication,
        notes: 'well known communication',
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnCommunication(observed, {
        notes: 'well known communication',
      })
    })

    it('gets unknown contact', async () => {
      havingContacts({
        type: ContactTypeCategory.Other,
        notes: 'unknown contact',
      })

      const observed = await subject.getActivityLogPage('some-crn', 'some offender')

      shouldReturnUnknown(observed, { notes: 'unknown contact' })
    })
  })

  it('gets a communication contact', async () => {
    const contact = fakeContactSummary({
      contactId: 111,
      notes: 'Some contact notes',
      contactStart: '2020-07-13T12:00:00',
      lastUpdatedDateTime: '2020-07-13T12:00:00',
      sensitive: false,
      lastUpdatedByUser: { forenames: 'Alan', surname: 'Jones' },
    })
    community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET
      .withArgs(match({ crn: 'some-crn', contactId: 111 }))
      .resolves(fakeOkResponse(contact))

    contactMapping.getTypeMeta.withArgs(contact).returns(
      Promise.resolve({
        name: 'Some communication with some offender',
        type: ContactTypeCategory.Communication,
        value: { name: 'Some contact', from: '{}', to: '{}', description: 'Some contact with {}' },
      } as CommunicationMetaResult),
    )

    const observed = await subject.getCommunicationContact('some-crn', 111, 'some offender')

    expect(observed).toEqual({
      id: 111,
      category: 'Other communication',
      start: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 12 }),
      name: 'Some contact with some offender',
      from: 'some offender',
      to: 'some offender',
      notes: 'Some contact notes',
      type: 'communication',
      lastUpdatedDateTime: DateTime.fromObject({ year: 2020, month: 7, day: 13, hour: 12 }),
      lastUpdatedBy: `Alan Jones`,
      sensitive: false,
      typeName: 'Some contact',
      tags: [],
      links: {
        addNotes: '/offender/some-crn/activity/communication/111/add-notes',
        view: '/offender/some-crn/activity/communication/111',
      },
    } as CommunicationActivityLogEntry)
  })
})
