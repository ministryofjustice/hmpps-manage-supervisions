import { ViewOffenderFixture } from './view-offender.fixture'
import * as faker from 'faker'
import { StubContactSummaryOptions } from '../../../mockApis/community-api'

class Fixture extends ViewOffenderFixture {
  havingOffenderContacts(...partials: StubContactSummaryOptions['partials']): this {
    cy.task('stubContactSummary', { crn: this.crn, partials })
    return this
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
      const link = `/offender/${this.crn}/appointment/${id}`
      const entry = page.entry(id)
      entry.title.contains(date).contains(time)
      entry.title.children(`a[href="${link}"]`).contains(name)

      entry.tags.should('have.length', tags.length)
      for (const { colour, text } of tags) {
        entry.tags.contains(text).should('have.class', `govuk-tag--${colour}`)
      }

      if (havingLongNotes) {
        entry.notes.contains(notes.substr(0, 200)) // just assert first 200 chars as it can cut off in the last word
        entry.longNotesLink.contains('View full details').should('have.attr', 'href').and('include', link)
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
  })
})
