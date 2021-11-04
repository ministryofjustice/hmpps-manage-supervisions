import {
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest,
  ContactSummary,
  ActivityLogGroup,
  ActivityLogEntry,
  KeyValue,
  OfficeLocation,
} from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import {
  fakeActivityLogGroup,
  fakeContactSummary,
  fakePaginated,
} from '../../src/server/community-api/community-api.fake'
import { ACTIVE_CONVICTION_ID } from './convictions'
import { DeepPartial } from '../../src/server/app.types'
import { MatchRules } from './wiremock/wiremock.types'

export const LONG_CONTACT_NOTES = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sed vestibulum risus, sed pretium nulla. Proin euismod nisl leo, eu porta purus tristique id. Morbi vel imperdiet magna. In eget ipsum a sem ullamcorper rhoncus sit amet eu metus. Donec dapibus ut leo vel finibus. Quisque quis lobortis risus. Sed massa erat, bibendum vitae ex malesuada, aliquet tristique risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent ac tempus est, eu pretium ipsum.
Quisque eget nisl vel enim interdum ultrices. Etiam at orci sodales, dignissim leo ac, iaculis odio. Sed a arcu suscipit, aliquet velit in, ultricies lectus. Suspendisse potenti. Nulla sagittis rhoncus facilisis. Quisque laoreet molestie malesuada. Cras ac varius diam. Maecenas lacinia volutpat magna. Maecenas hendrerit enim nec magna aliquet, tempor interdum magna tempor.
Suspendisse sed nisi faucibus, dapibus lorem eu, sollicitudin mi. Phasellus ac luctus massa, sit amet maximus ex. Duis auctor mauris nec tincidunt elementum. Nunc molestie, ligula vel iaculis venenatis, nulla velit accumsan orci, eu laoreet justo metus eu mauris. Nulla eros nulla, interdum vitae tristique non, ornare at purus. Duis sed diam consequat, elementum magna quis, feugiat dui. Nunc et nulla nunc. Cras facilisis nec arcu vitae pulvinar. Phasellus ex tellus, hendrerit id enim semper, vestibulum pharetra ipsum. Donec sagittis fermentum metus, vitae rhoncus tortor. Fusce sit amet aliquet tellus. Nunc imperdiet lectus id mi volutpat, vitae venenatis eros tincidunt. Duis non nibh et nunc mollis posuere quis egestas elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam eu lacinia metus, at sollicitudin est. Proin at massa imperdiet, porttitor magna non, lacinia nisl.
Cras congue vitae odio eu rutrum. Donec in dictum massa. Vivamus at placerat neque, at dictum est. Etiam facilisis magna at tempor mattis. Pellentesque finibus condimentum justo, at efficitur nibh.`

const COMMUNICATION_CATEGORIES: KeyValue[] = [
  {
    code: 'LT',
    description: 'Communication',
  },
]

export const ACTIVITY_LOG_GROUPS: DeepPartial<ActivityLogGroup>[] = [
  {
    date: '2020-09-04',
    rarDay: false,
    entries: [
      {
        contactId: 8,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'NOT_WELL_KNOWN_COMMUNICATION',
          description: 'Not a well known communication',
          appointment: false,
          categories: COMMUNICATION_CATEGORIES,
        },
        startTime: '14:00:00',
        endTime: null,
        notes: 'Some unknown communication\n<a href="#dont-click-this">this should not be a link</a>',
        outcome: null,
        lastUpdatedDateTime: '2020-09-04T15:20:23+01:00',
        lastUpdatedByUser: { forenames: 'John', surname: 'Rover' },
        sensitive: true,
        rarActivity: null,
      },
      {
        contactId: 7,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'CMOB',
          description: 'eMail/Text to Offender',
          appointment: false,
          categories: COMMUNICATION_CATEGORIES,
        },
        startTime: '13:00:00',
        endTime: null,
        notes:
          'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
        outcome: null,
        lastUpdatedDateTime: '2020-09-04T14:20:23+01:00',
        lastUpdatedByUser: { forenames: 'John', surname: 'Smith' },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 1,
        convictionId: ACTIVE_CONVICTION_ID,
        type: { code: 'CHVS', description: 'Home Visit to Case (NS)', appointment: true, nationalStandard: true },
        startTime: '12:00:00',
        endTime: '13:00:00',
        notes: LONG_CONTACT_NOTES,
        staff: { forenames: 'Catherine', surname: 'Ellis', unallocated: false },
        outcome: { complied: true, attended: true },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 6,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'CTOA',
          description: 'Phone Contact from Offender',
          appointment: false,
          categories: COMMUNICATION_CATEGORIES,
        },
        startTime: '11:00:00',
        endTime: null,
        notes: null,
        outcome: null,
        lastUpdatedDateTime: '2020-09-04T11:20:23+01:00',
        lastUpdatedByUser: { forenames: 'Andy', surname: 'Smith' },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 9,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'SYSTEM_GENERATED_UNKNOWN',
          description: 'System generated unknown contact',
          appointment: false,
          systemGenerated: true,
        },
        startTime: null,
        endTime: null,
        notes: 'Unknown system generated contact',
        outcome: null,
        lastUpdatedDateTime: '2020-09-04T14:20:23+01:00',
        lastUpdatedByUser: { forenames: 'Michael', surname: 'Smith' },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 11,
        type: {
          code: 'CMRQ',
          description: 'CPS Package Request',
          appointment: false,
        },
        startTime: null,
        endTime: null,
        outcome: null,
        notes: 'CPS request',
        lastUpdatedDateTime: '2020-09-04T15:20:23+01:00',
        lastUpdatedByUser: { forenames: 'John', surname: 'Rover' },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 12,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'CLOB',
          description: 'Letter/Fax to Offender',
          appointment: false,
          categories: COMMUNICATION_CATEGORIES,
        },
        startTime: '13:00:00',
        endTime: null,
        notes: 'Letter sent to Liz.',
        outcome: null,
        lastUpdatedDateTime: '2020-09-04T14:20:23+01:00',
        lastUpdatedByUser: { forenames: 'John', surname: 'Smith' },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 100,
        convictionId: null,
        type: {
          code: 'ABC1',
          description: 'Some offender level contact',
          appointment: false,
        },
        startTime: null,
        endTime: null,
        outcome: null,
        notes: null,
        lastUpdatedDateTime: '2020-09-04T16:20:23+01:00',
        lastUpdatedByUser: { forenames: 'Nancy', surname: 'Leonard' },
        sensitive: false,
        rarActivity: null,
      },
    ],
  },
  {
    date: '2020-09-03',
    rarDay: true,
    entries: [
      {
        contactId: 2,
        convictionId: ACTIVE_CONVICTION_ID,
        type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
        startTime: '10:30:00',
        endTime: null,
        notes: 'Some office visit appointment\n\nWith a new line!',
        staff: { unallocated: true },
        outcome: { complied: false, attended: true },
        sensitive: false,
        rarActivity: null,
      },
      {
        contactId: 3,
        convictionId: ACTIVE_CONVICTION_ID,
        type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
        startTime: '11:00:00',
        endTime: '11:30:00',
        notes: LONG_CONTACT_NOTES,
        staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
        outcome: { complied: true, attended: false, description: 'Holiday' },
        sensitive: true,
        rarActivity: null,
      },
      {
        contactId: 4,
        convictionId: ACTIVE_CONVICTION_ID,
        type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
        startTime: '11:30:00',
        endTime: '12:00:00',
        notes: LONG_CONTACT_NOTES,
        staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
        outcome: { complied: false, attended: false },
        enforcement: { enforcementAction: { code: 'WLS', description: 'Warning letter requested' } },
        rarActivity: {
          nsiId: 101,
          requirementId: 102,
          type: { description: 'Attitudes, thinking and behaviour' },
          subtype: { description: 'Racially Motivated Offending' },
        },
        sensitive: false,
      },
    ],
  },
  {
    date: '2020-09-02',
    rarDay: false,
    entries: [
      {
        contactId: 5,
        convictionId: ACTIVE_CONVICTION_ID,
        type: { code: 'NOT_WELL_KNOWN', description: 'Not a well known appointment', appointment: true },
        startTime: '11:00:00',
        endTime: '13:00:00',
        notes: 'Some unknown appointment',
        staff: { forenames: 'Robert', surname: 'Ohagan', unallocated: false },
        outcome: null,
        sensitive: false,
        rarActivity: {
          nsiId: 111,
          requirementId: 112,
          type: { description: 'Finance, benefits and debt' },
          subtype: null,
        },
      },
    ],
  },
  {
    date: '2019-05-05',
    rarDay: false,
    entries: [
      {
        contactId: 10,
        convictionId: ACTIVE_CONVICTION_ID,
        type: {
          code: 'ABNP',
          description: 'Breach Outcome - not proven',
          appointment: false,
        },
        startTime: null,
        endTime: null,
        outcome: null,
        sensitive: false,
        notes: null,
        rarActivity: null,
      },
    ],
  },
]

type CommonContactApiQuery = Omit<
  | ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest
  | ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest,
  'crn'
>

const STATIC_LOCATION: OfficeLocation = {
  code: 'OFF1',
  description: 'Main Office',
}

/**
 * Seeds contact summary & activity log APIs with a common set of contacts.
 * TODO this is not conviction ID aware so for previous convictions we get the same results...
 */
export function contacts(crn: string, partials = ACTIVITY_LOG_GROUPS, officeLocation = STATIC_LOCATION): SeedFn {
  return context => {
    const activityLogGroups = partials.map(p => fakeActivityLogGroup(p))
    const contacts = activityLogGroups.flatMap(grp =>
      grp.entries.map(e =>
        fakeContactSummary({
          contactId: e.contactId,
          contactStart: `${grp.date}T${e.startTime || '00:00:00'}`,
          contactEnd: `${grp.date}T${e.endTime || '00:00:00'}`,
          officeLocation: e.type.appointment ? officeLocation : null,
          notes: e.notes,
          outcome: e.outcome,
          sensitive: e.sensitive,
          type: e.type,
          staff: e.staff,
          lastUpdatedDateTime: e.lastUpdatedDateTime,
          lastUpdatedByUser: e.lastUpdatedByUser,
          rarActivityDetail: e.rarActivity,
          enforcement: e.enforcement,
        }),
      ),
    )

    let priority = 0
    function all(
      query: CommonContactApiQuery = {},
      predicate?: (contact: ContactSummary | ActivityLogEntry) => boolean,
      rule?: keyof MatchRules,
    ) {
      context.client.community
        .priority(++priority)
        .get(`/secure/offenders/crn/${crn}/contact-summary`)
        .query(query || {}, rule)
        .returns(fakePaginated(predicate ? contacts.filter(predicate) : contacts))

      context.client.community
        .priority(priority)
        .get(`/secure/offenders/crn/${crn}/activity-log`)
        .query(query, rule)
        .returns(
          fakePaginated(
            activityLogGroups
              .map(grp => ({ ...grp, entries: predicate ? grp.entries.filter(predicate) : grp.entries }))
              .filter(x => x.entries.length > 0),
          ),
        )
    }

    // complied appointments only
    all(
      { appointmentsOnly: true, nationalStandard: true, attended: true, complied: true },
      c => c.type.appointment && c.outcome?.attended && c.outcome?.complied,
    )

    // acceptable absence appointments only
    all(
      { appointmentsOnly: true, nationalStandard: true, attended: false, complied: true },
      c => c.type.appointment && c.outcome?.attended === false && c.outcome?.complied,
    )

    // ftc appointments only
    all(
      { appointmentsOnly: true, nationalStandard: true, complied: false },
      c => c.type.appointment && c.outcome?.complied === false,
    )

    // appointments without an outcome only
    all(
      { appointmentsOnly: true, nationalStandard: true, outcome: false },
      c => c.type.appointment && (c.outcome === null || c.outcome === undefined),
    )

    // rar activity only
    all({ rarActivity: true }, c => !!c.rarActivity)

    // appointments only
    all({ appointmentsOnly: true, nationalStandard: true }, c => c.type.appointment)

    // HACK: for warning letters, we send a list of contact types, this is only applicable to the active conviction
    all({ convictionId: ACTIVE_CONVICTION_ID, contactTypes: '.+' as any }, () => false, 'matches')

    // all contacts with no filter
    all()

    // get each contact by id
    for (const contact of contacts) {
      context.client.community.get(`/secure/offenders/crn/${crn}/contacts/${contact.contactId}`).returns(contact)
    }
  }
}
