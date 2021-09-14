import {
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
} from '../../src/server/community-api/client'
import { SeedFn } from './wiremock'
import { fakeContactSummary } from '../../src/server/community-api/community-api.fake'

export const LONG_CONTACT_NOTES = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sed vestibulum risus, sed pretium nulla. Proin euismod nisl leo, eu porta purus tristique id. Morbi vel imperdiet magna. In eget ipsum a sem ullamcorper rhoncus sit amet eu metus. Donec dapibus ut leo vel finibus. Quisque quis lobortis risus. Sed massa erat, bibendum vitae ex malesuada, aliquet tristique risus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent ac tempus est, eu pretium ipsum.
Quisque eget nisl vel enim interdum ultrices. Etiam at orci sodales, dignissim leo ac, iaculis odio. Sed a arcu suscipit, aliquet velit in, ultricies lectus. Suspendisse potenti. Nulla sagittis rhoncus facilisis. Quisque laoreet molestie malesuada. Cras ac varius diam. Maecenas lacinia volutpat magna. Maecenas hendrerit enim nec magna aliquet, tempor interdum magna tempor.
Suspendisse sed nisi faucibus, dapibus lorem eu, sollicitudin mi. Phasellus ac luctus massa, sit amet maximus ex. Duis auctor mauris nec tincidunt elementum. Nunc molestie, ligula vel iaculis venenatis, nulla velit accumsan orci, eu laoreet justo metus eu mauris. Nulla eros nulla, interdum vitae tristique non, ornare at purus. Duis sed diam consequat, elementum magna quis, feugiat dui. Nunc et nulla nunc. Cras facilisis nec arcu vitae pulvinar. Phasellus ex tellus, hendrerit id enim semper, vestibulum pharetra ipsum. Donec sagittis fermentum metus, vitae rhoncus tortor. Fusce sit amet aliquet tellus. Nunc imperdiet lectus id mi volutpat, vitae venenatis eros tincidunt. Duis non nibh et nunc mollis posuere quis egestas elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam eu lacinia metus, at sollicitudin est. Proin at massa imperdiet, porttitor magna non, lacinia nisl.
Cras congue vitae odio eu rutrum. Donec in dictum massa. Vivamus at placerat neque, at dictum est. Etiam facilisis magna at tempor mattis. Pellentesque finibus condimentum justo, at efficitur nibh.`

export const CONTACTS: DeepPartial<ContactSummary>[] = [
  {
    contactId: 1,
    type: { code: 'CHVS', description: 'Home Visit to Case (NS)', appointment: true, nationalStandard: true },
    contactStart: '2020-09-04T12:00:00+01:00',
    contactEnd: '2020-09-04T13:00:00+01:00',
    notes: LONG_CONTACT_NOTES,
    staff: { forenames: 'Catherine', surname: 'Ellis', unallocated: false },
    outcome: { complied: true, attended: true },
    sensitive: false,
  },
  {
    contactId: 2,
    type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
    contactStart: '2020-09-03T10:30:00+01:00',
    contactEnd: '2020-09-03T11:00:00+01:00',
    notes: 'Some office visit appointment\n\nWith a new line!',
    staff: { unallocated: true },
    outcome: { complied: false, attended: true },
    sensitive: false,
  },
  {
    contactId: 3,
    type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
    contactStart: '2020-09-03T11:00:00+01:00',
    contactEnd: '2020-09-03T11:30:00+01:00',
    notes: LONG_CONTACT_NOTES,
    staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
    outcome: { complied: true, attended: false },
    sensitive: true,
  },
  {
    contactId: 4,
    type: { code: 'APAT', description: 'Office visit', appointment: true, nationalStandard: false },
    contactStart: '2020-09-03T11:30:00+01:00',
    contactEnd: '2020-09-03T12:00:00+01:00',
    notes: LONG_CONTACT_NOTES,
    staff: { forenames: 'Unallocated', surname: 'Staff', unallocated: true },
    outcome: { complied: false, attended: false },
    rarActivity: true,
    sensitive: false,
  },
  {
    contactId: 5,
    type: { code: 'NOT_WELL_KNOWN', description: 'Not a well known appointment', appointment: true },
    contactStart: '2020-09-02T11:00:00+01:00',
    contactEnd: '2020-09-02T13:00:00+01:00',
    notes: 'Some unknown appointment',
    staff: { forenames: 'Robert', surname: 'Ohagan', unallocated: false },
    outcome: null,
    sensitive: false,
  },

  {
    contactId: 6,
    type: { code: 'CTOA', description: 'Phone Contact from Offender', appointment: false },
    contactStart: '2020-09-04T11:00:00+01:00',
    contactEnd: '2020-09-04T00:00:00+01:00',
    notes: null,
    outcome: null,
    lastUpdatedDateTime: '2020-09-04T11:20:23+01:00',
    lastUpdatedByUser: { forenames: `Andy`, surname: `Smith` },
    sensitive: false,
  },
  {
    contactId: 7,
    type: { code: 'CMOB', description: 'eMail/Text to Offender', appointment: false },
    contactStart: '2020-09-04T13:00:00+01:00',
    contactEnd: '2020-09-04T00:00:00+01:00',
    notes:
      'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
    outcome: null,
    lastUpdatedDateTime: '2020-09-04T14:20:23+01:00',
    lastUpdatedByUser: { forenames: `John`, surname: `Smith` },
    sensitive: false,
  },
  {
    contactId: 8,
    type: {
      code: 'NOT_WELL_KNOWN_COMMUNICATION',
      description: 'Not a well known communication',
      appointment: false,
    },
    contactStart: '2020-09-04T14:00:00+01:00',
    contactEnd: '2020-09-04T00:00:00+01:00',
    notes: 'Some unknown communication',
    outcome: null,
    lastUpdatedDateTime: '2020-09-04T15:20:23+01:00',
    lastUpdatedByUser: { forenames: `John`, surname: `Rover` },
    sensitive: true,
  },
  {
    contactId: 9,
    type: {
      code: 'SYSTEM_GENERATED_UNKNOWN',
      description: 'System generated unknown contact',
      appointment: false,
    },
    contactStart: '2020-09-04T14:00:00+01:00',
    contactEnd: '2020-09-04T00:00:00+01:00',
    notes: 'Unknown system generated contact',
    outcome: null,
    lastUpdatedDateTime: '2020-09-04T14:20:23+01:00',
    lastUpdatedByUser: { forenames: `Michael`, surname: `Smith` },
    sensitive: false,
  },
  {
    contactId: 10,
    type: {
      code: 'ABNP',
      description: 'Breach Outcome - not proven',
      appointment: false,
    },
    contactStart: '2019-05-05T00:00:00+01:00',
    contactEnd: '2019-05-05T00:00:00+01:00',
    outcome: null,
    sensitive: false,
  },
  {
    contactId: 11,
    type: {
      code: 'CMRQ',
      description: 'CPS Package Request',
      appointment: false,
    },
    contactStart: '2020-09-04T14:00:00+01:00',
    contactEnd: '2020-09-04T00:00:00+01:00',
    outcome: null,
    notes: 'CPS request',
    lastUpdatedDateTime: '2020-09-04T15:20:23+01:00',
    lastUpdatedByUser: { forenames: `John`, surname: `Rover` },
    sensitive: false,
  },
]

export function contacts(crn: string, partials: DeepPartial<ContactSummary>[] = CONTACTS): SeedFn {
  return context => {
    const contacts = partials.map(p => fakeContactSummary(p))

    let priority = 1
    function all(
      query: Omit<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest, 'crn'> = {},
      predicate?: (contact: ContactSummary) => boolean,
      rule?: keyof WireMock.MatchRules,
    ) {
      const filtered = predicate ? contacts.filter(predicate) : contacts
      context.client.community
        .priority(priority++)
        .get(`/secure/offenders/crn/${crn}/contact-summary`)
        .query(query, rule)
        .returns({
          content: filtered,
          number: 0,
          size: filtered.length || 10,
          numberOfElements: filtered.length,
          totalPages: filtered.length === 0 ? 0 : 1,
          totalElements: filtered.length,
          first: true,
          last: false,
          empty: filtered.length === 0,
        })
    }

    // complied appointments only
    all(
      { appointmentsOnly: true, attended: true, complied: true },
      c => c.type.appointment && c.outcome?.attended && c.outcome?.complied,
    )

    // acceptable absence appointments only
    all(
      { appointmentsOnly: true, attended: false, complied: true },
      c => c.type.appointment && c.outcome?.attended === false && c.outcome?.complied,
    )

    // ftc appointments only
    all({ appointmentsOnly: true, complied: false }, c => c.type.appointment && c.outcome?.complied === false)

    // appointments without an outcome only
    all(
      { appointmentsOnly: true, outcome: false },
      c => c.type.appointment && (c.outcome === null || c.outcome === undefined),
    )

    // appointments only
    all({ appointmentsOnly: true }, c => c.type.appointment)

    // TODO remove this once we stop using it
    // HACK: we're only using the include filter in a single place so we're hard coding it here
    const commsTypeList = ['CT3A', 'CT3B', 'CTOA', 'CTOB', 'CM3A', 'CMOA', 'CMOB', 'NOT_WELL_KNOWN_COMMUNICATION']
    all({ include: ['.+'] }, c => c.type.appointment || commsTypeList.indexOf(c.type.code) > 0, 'matches')

    // all contacts with no filter
    all()

    // get each contact by id
    for (const contact of contacts) {
      context.client.community.get(`/secure/offenders/crn/${crn}/contacts/${contact.contactId}`).returns(contact)
    }
  }
}
