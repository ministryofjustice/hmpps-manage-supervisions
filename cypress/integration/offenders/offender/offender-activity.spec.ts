import { ViewOffenderFixture } from './view-offender.fixture'
import * as faker from 'faker'
import { StubContactSummaryOptions, StubGetAppointmentOptions } from '../../../mockApis/community-api'
import { OffenderActivityAppointmentPage } from '../../../pages'

class Fixture extends ViewOffenderFixture {
  havingOffenderContacts(...partials: StubContactSummaryOptions['partials']): this {
    cy.task('stubGetAppointmentTypes')
    cy.task('stubGetContactTypes')
    cy.task('stubContactSummary', { crn: this.crn, partials })
    return this
  }

  havingOffenderAppointment(partial: Omit<StubGetAppointmentOptions, 'crn'>): this {
    cy.task('stubGetAppointment', { crn: this.crn, ...partial })
    return this
  }

  whenClickingActivityEntry(id: number) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.entry(id).title.find('a').click()
    })
  }

  shouldRenderActivity({
    id,
    date,
    time,
    name,
    notes,
    tags = [],
    havingAttendanceMissing = false,
    havingLongNotes = false,
  }: {
    id: number
    date: string
    time: string
    name: string
    notes: string
    tags?: { colour: string; text: string }[]
    havingAttendanceMissing?: boolean
    havingLongNotes?: boolean
  }) {
    return this.shouldRenderOffenderTab('activity', page => {
      const entry = page.entry(id)
      entry.title.contains(date).contains(time)
      entry.title.find('a').contains(name)

      entry.tags.should('have.length', tags.length)
      for (const { colour, text } of tags) {
        entry.tags.contains(text).should('have.class', `govuk-tag--${colour}`)
      }

      if (havingLongNotes) {
        entry.notes.contains(notes.substr(0, 200)) // just assert first 200 chars as it can cut off in the last word
        entry.longNotesLink.contains('View full details').should('have.attr', 'href')
      } else {
        entry.notes.contains(notes)
      }

      if (havingAttendanceMissing) {
        entry.attendanceMissing.contains('Attendance not recorded')
        entry.attendanceMissing
          .get(`a[href="/offender/${this.crn}/appointment/${id}/record-outcome"]`)
          .contains('Record attendance')
      }
    })
  }

  shouldRenderAppointmentPage(title: string, assert: (page: OffenderActivityAppointmentPage) => void) {
    const page = new OffenderActivityAppointmentPage()
    page.pageTitle.contains(title)
    assert(page)
  }
}

context('ViewOffenderActivity', () => {
  const fixture = new Fixture()

  beforeEach(() => fixture.reset())

  it('can add log entry from activity log', () => {
    fixture
      .havingOffender()
      .havingOffenderContacts()
      .whenViewingOffender()
      .whenClickingSubNavTab('activity')
      .shouldRenderOffenderTab('activity', page => {
        page.addToLogButton.contains('Add to log').click()
        cy.url().should('include', '/offender/ABC123/activity/new')
      })
  })

  it('displays empty activity log', () => {
    fixture
      .havingOffender()
      .havingOffenderContacts()
      .whenViewingOffender()
      .whenClickingSubNavTab('activity')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('activity', page => {
        page.emptyMessage.contains('There are no entries in the activity log.')
      })
  })

  it('displays activity log', () => {
    const longNotes = faker.lorem.sentence(300)
    fixture
      .havingOffender()
      .havingOffenderContacts(
        {
          type: { code: 'CHVS' },
          contactStart: '2020-09-04T12:00:00+01:00',
          contactEnd: '2020-09-04T13:00:00+01:00',
          notes: 'Some home visit appointment',
          outcome: { complied: true, attended: true },
        },
        {
          type: { code: 'APAT' },
          contactStart: '2020-09-03T10:30:00+01:00',
          contactEnd: '2020-09-03T11:15:00+01:00',
          notes: longNotes,
          staff: { unallocated: true },
          outcome: { complied: false, attended: true },
        },
        {
          type: { code: 'APAT' },
          contactStart: '2020-09-03T10:30:00+01:00',
          contactEnd: '2020-09-03T11:15:00+01:00',
          notes: longNotes,
          staff: { unallocated: true },
          outcome: { complied: true, attended: false },
          sensitive: true,
        },
        {
          type: { code: 'APAT' },
          contactStart: '2020-09-03T10:30:00+01:00',
          contactEnd: '2020-09-03T11:15:00+01:00',
          notes: longNotes,
          staff: { unallocated: true },
          outcome: { complied: false, attended: false },
          rarActivity: true,
        },
        {
          type: { code: 'NOT_WELL_KNOWN', description: 'Not a well known appointment', appointment: true },
          contactStart: '2020-09-02T11:00:00+01:00',
          contactEnd: '2020-09-02T13:00:00+01:00',
          notes: 'Some unknown appointment',
          outcome: null,
        },
        {
          type: { code: 'CTOA', description: 'Phone Contact from Offender', appointment: false },
          contactStart: '2020-09-04T11:00:00+01:00',
          contactEnd: '2020-09-04T00:00:00+01:00',
          notes: 'Phone call from Brian to double check when his next appointment was.',
          outcome: null,
        },
        {
          type: { code: 'CMOB', description: 'eMail/Text to Offender', appointment: false },
          contactStart: '2020-09-04T13:00:00+01:00',
          contactEnd: '2020-09-04T00:00:00+01:00',
          notes:
            'Hi Brian - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
          outcome: null,
        },
        {
          type: {
            code: 'NOT_WELL_KNOWN_COMMUNICATION',
            description: 'Not a well known communication',
            appointment: false,
          },
          contactStart: '2020-09-04T14:00:00+01:00',
          contactEnd: '2020-09-04T00:00:00+01:00',
          notes: 'Some unknown communication',
          outcome: null,
        },
        {
          type: {
            code: 'SYSTEM_GENERATED_UNKNOWN',
            description: 'System generated unknown contact',
            appointment: false,
          },
          contactStart: '2020-09-04T14:00:00+01:00',
          contactEnd: '2020-09-04T00:00:00+01:00',
          notes: 'Unknown system generated contact',
          outcome: null,
        },
      )

      .whenViewingOffender()
      .whenClickingSubNavTab('activity')

      .shouldDisplayCommonHeader()

      .shouldRenderActivity({
        id: 1,
        date: 'Friday 4 September 2020',
        time: '12pm to 1pm',
        name: 'Home visit with Mark Berridge',
        notes: 'Some home visit appointment',
        tags: [{ colour: 'green', text: 'complied' }],
      })

      .shouldRenderActivity({
        id: 2,
        date: 'Thursday 3 September 2020',
        time: '10:30am to 11:15am',
        name: 'Office visit',
        notes: longNotes,
        tags: [{ colour: 'red', text: 'failed to comply' }],
        havingLongNotes: true,
      })

      .shouldRenderActivity({
        id: 3,
        date: 'Thursday 3 September 2020',
        time: '10:30am to 11:15am',
        name: 'Office visit',
        notes: longNotes,
        tags: [
          { colour: 'grey', text: 'sensitive' },
          { colour: 'green', text: 'acceptable absence' },
        ],
        havingLongNotes: true,
      })

      .shouldRenderActivity({
        id: 4,
        date: 'Thursday 3 September 2020',
        time: '10:30am to 11:15am',
        name: 'Office visit',
        notes: longNotes,
        tags: [
          { colour: 'purple', text: 'rar' },
          { colour: 'red', text: 'unacceptable absence' },
        ],
        havingLongNotes: true,
      })

      .shouldRenderActivity({
        id: 5,
        date: 'Wednesday 2 September 2020',
        time: '11am to 1pm',
        name: 'Not a well known appointment with Mark Berridge',
        notes: 'Some unknown appointment',
        havingAttendanceMissing: true,
      })

      .shouldRenderActivity({
        id: 6,
        date: 'Friday 4 September 2020',
        time: '11am',
        name: 'Phone call from Offender',
        notes: 'Phone call from Brian to double check when his next appointment was.',
      })

      .shouldRenderActivity({
        id: 7,
        date: 'Friday 4 September 2020',
        time: '1pm',
        name: 'Email/Text to Offender',
        notes:
          'Hi Brian - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
      })

      .shouldRenderActivity({
        id: 8,
        date: 'Friday 4 September 2020',
        time: '2pm',
        name: 'Not a well known communication',
        notes: 'Some unknown communication',
      })

      .shouldRenderActivity({
        id: 9,
        date: 'Friday 4 September 2020',
        time: '2pm',
        name: 'System generated unknown contact',
        notes: 'Unknown system generated contact',
      })
  })

  it('displays appointment detail without outcome', () => {
    fixture
      .havingOffender()
      .havingOffenderContacts({
        type: { code: 'CHVS' },
        contactStart: '2020-09-04T12:00:00+01:00',
        contactEnd: '2020-09-04T13:00:00+01:00',
        notes: 'Some home visit appointment',
        outcome: { complied: true, attended: true },
      })

      .havingOffenderAppointment({
        appointmentId: 1,
        start: '2020-09-04T12:00:00+01:00',
        end: '2020-09-04T13:00:00+01:00',
      })

      .whenViewingOffender()
      .whenClickingSubNavTab('activity')
      .whenClickingActivityEntry(1)

      .shouldRenderAppointmentPage('Previous appointment Office visit with Some Staff', page => {
        page.detail('Type of appointment').contains('Office visit')
        page.detail('Date').contains('4 September 2020')
        page.detail('Time').contains('12pm to 1pm')
        page.detail('Appointment notes').contains('Some office visit appointment')
        page.detail('Sensitive').contains('Yes')
        page.detail('RAR activity').contains('Yes')
        page.detail('Counts towards RAR').contains('Yes')

        page.outcomeTable.should('not.exist')
      })
  })

  it('displays appointment detail with outcome', () => {
    fixture
      .havingOffender()
      .havingOffenderContacts({
        type: { code: 'CHVS' },
        contactStart: '2020-09-04T12:00:00+01:00',
        contactEnd: '2020-09-04T13:00:00+01:00',
        notes: 'Some home visit appointment',
        outcome: { complied: true, attended: true },
      })

      .havingOffenderAppointment({
        appointmentId: 1,
        start: '2020-09-04T12:00:00+01:00',
        end: '2020-09-04T13:00:00+01:00',
        outcome: {
          attended: true,
          complied: true,
          description: 'Some outcome description',
        },
      })

      .whenViewingOffender()
      .whenClickingSubNavTab('activity')
      .whenClickingActivityEntry(1)

      .shouldRenderAppointmentPage('Previous appointment Office visit with Some Staff', page => {
        page.outcome('Attended').contains('Yes')
        page.outcome('Complied').contains('Yes')
        page.outcome('Description').contains('Some outcome description')
      })
  })

  it('displays communication', () => {
    fixture
      .havingOffender()
      .havingOffenderContacts({
        type: { code: 'CMOB' },
        contactStart: '2020-09-04T12:00:00+01:00',
        contactEnd: '2020-09-04T00:00:00+01:00',
        notes: 'Some text message',
        outcome: null,
      })

      .havingOffenderAppointment({
        appointmentId: 1,
        start: '2020-09-04T12:00:00+01:00',
        end: '2020-09-04T13:00:00+01:00',
      })

      .whenViewingOffender()
      .whenClickingSubNavTab('activity')
      .whenClickingActivityEntry(1)

      .shouldRenderAppointmentPage('Previous appointment Office visit with Some Staff', page => {
        page.detail('Type of appointment').contains('Office visit')
        page.detail('Date').contains('4 September 2020')
        page.detail('Time').contains('12pm to 1pm')
        page.detail('Appointment notes').contains('Some office visit appointment')
        page.detail('Sensitive').contains('Yes')
        page.detail('RAR activity').contains('Yes')
        page.detail('Counts towards RAR').contains('Yes')

        page.outcomeTable.should('not.exist')
      })
  })
})
