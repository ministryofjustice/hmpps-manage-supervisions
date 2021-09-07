import { ViewOffenderFixture } from './view-offender.fixture'
import { OffenderActivityAppointmentPage } from '../../../pages'
import { LONG_CONTACT_NOTES } from '../../../plugins/contacts'
import { OffenderActivityCommunicationPage } from '../../../pages/offender-activity-communication.page'

class Fixture extends ViewOffenderFixture {
  whenClickingActivityEntry(id: number) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.entry(id).title.find('a').click()
    })
  }

  whenClickingFailuresToComplyFilter() {
    return this.shouldRenderOffenderTab('activity', page => {
      page.filterLink('failed-to-comply-appointments').click()
    })
  }

  whenClickingWithoutAnOutcomeFilter() {
    return this.shouldRenderOffenderTab('activity', page => {
      page.filterLink('without-an-outcome').click()
    })
  }

  shouldRenderActivity({
    id,
    date,
    time,
    name,
    notes,
    tags = [],
    havingLongNotes = false,
  }: {
    id: number
    date: string
    time: string
    name: string
    notes: string
    tags?: { colour: string; text: string }[]
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
    })
  }

  shouldNotRenderActivity({ id }: { id: number }) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.entry(id).title.should('not.exist')
    })
  }

  shouldNotRenderActivities(ids: number[]) {
    return ids.map(id => this.shouldNotRenderActivity({ id: id }))
  }

  shouldRenderAppointmentPage(title: string, assert: (page: OffenderActivityAppointmentPage) => void) {
    const page = new OffenderActivityAppointmentPage()
    page.pageTitle.contains(title)
    assert(page)
  }

  shouldRenderCommunicationPage(title: string, assert: (page: OffenderActivityCommunicationPage) => void) {
    const page = new OffenderActivityCommunicationPage()
    page.pageTitle.contains(title)
    assert(page)
  }
}

context('Offender activity tab', () => {
  const fixture = new Fixture()

  describe('empty activity log', () => {
    before(() => {
      cy.seed({ contacts: [] })
    })

    it('can add log entry from activity log', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .shouldRenderOffenderTab('activity', page => {
          page.addToLogButton.contains('Add to log').click()
        })
        .shouldDisplayExitPage('delius')
    })

    it('displays empty activity log', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('activity', page => {
          page.emptyMessage.contains('There are no entries in the activity log.')
        })
    })
  })

  describe('populated activity log', () => {
    before(() => {
      cy.seed()
    })

    it('displays activity log', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')

        .shouldDisplayCommonHeader()

        .shouldRenderActivity({
          id: 1,
          date: 'Friday 4 September 2020',
          time: '12pm to 1pm',
          name: 'Home visit with Catherine Ellis',
          notes: 'Some home visit appointment With a new line!',
          tags: [
            { colour: 'grey', text: 'national standard (ns)' },
            { colour: 'green', text: 'complied' },
          ],
        })

        .shouldRenderActivity({
          id: 2,
          date: 'Thursday 3 September 2020',
          time: '10:30am to 11:15am',
          name: 'Office visit',
          notes: LONG_CONTACT_NOTES,
          tags: [{ colour: 'red', text: 'failed to comply' }],
          havingLongNotes: true,
        })

        .shouldRenderActivity({
          id: 3,
          date: 'Thursday 3 September 2020',
          time: '10:30am to 11:15am',
          name: 'Office visit',
          notes: LONG_CONTACT_NOTES,
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
          notes: LONG_CONTACT_NOTES,
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
          name: 'Not a well known appointment with Robert Ohagan',
          notes: 'Some unknown appointment',
        })

        .shouldRenderActivity({
          id: 6,
          date: 'Friday 4 September 2020',
          time: '11am',
          name: 'Phone call from Liz Danger Haggis',
          notes: 'Phone call from Liz to double check when his next appointment was.',
        })

        .shouldRenderActivity({
          id: 7,
          date: 'Friday 4 September 2020',
          time: '1pm',
          name: 'Email or text message to Liz Danger Haggis',
          notes:
            'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
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

        .shouldRenderActivity({
          id: 11,
          date: 'Friday 4 September 2020',
          time: '2pm',
          name: 'CPS pack requested',
          notes: 'CPS request',
        })
    })

    it('displays attendance missing', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .shouldRenderOffenderTab('activity', page => {
          const entry = page.entry(5)
          entry.attendanceMissing.contains('Attendance not recorded')
          entry.attendanceMissing.contains('Record attendance').click()
        })
        .shouldDisplayExitPage('delius')
    })

    it('displays appointment detail without outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(1)

        .shouldRenderAppointmentPage('Home visit with Catherine Ellis', page => {
          page.detail('Type of appointment').contains('Home visit')
          page.detail('Date').contains('2 January 2200')
          page.detail('Time').contains('1:30pm to 2pm')
          page.detail('Appointment notes').contains('Some home visit appointment')
          page.detail('Sensitive').contains('Yes')
          page.detail('RAR activity').contains('Yes')
          page.detail('Counts towards RAR').contains('Yes')

          page.outcomeTable.should('not.exist')
        })
    })

    it('displays appointment detail with outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(2)

        .shouldRenderAppointmentPage('Some recent appointment', page => {
          page.outcome('Attended').contains('Yes')
          page.outcome('Complied').contains('Yes')
          page.outcome('Description').contains('Some outcome description')
        })
    })
    it('displays phone call communication detail ', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(6)

        .shouldRenderCommunicationPage('Phone call from Liz Danger Haggis', page => {
          page.detail('From').contains('Liz Danger Haggis')
          page.detailShouldNotExist('To')
          page.detail('Date').contains('4 September 2020')
          page.detail('Time').contains('11am')
          page.detail('Details').contains('Phone call from Liz to double check when his next appointment was.')
          page.getLastUpdated().contains('Last updated by Andy Smith on Friday 4 September 2020 at 11:20am')
        })
    })
    it('displays email/text communication detail ', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(7)

        .shouldRenderCommunicationPage('Email or text message to Liz Danger Haggis', page => {
          page.detail('To').contains('Liz Danger Haggis')
          page.detailShouldNotExist('From')
          page.detail('Date').contains('4 September 2020')
          page.detail('Time').contains('1pm')
          page
            .detail('Details')
            .contains(
              'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00',
            )
          page.getLastUpdated().contains('Last updated by John Smith on Friday 4 September 2020 at 2:20pm')
        })
    })
    it('displays activity log filtered to display failure to complies', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingFailuresToComplyFilter()
        .shouldRenderActivity({
          id: 2,
          date: 'Thursday 3 September 2020',
          time: '10:30am to 11:15am',
          name: 'Office visit',
          notes: LONG_CONTACT_NOTES,
          tags: [{ colour: 'red', text: 'failed to comply' }],
          havingLongNotes: true,
        })
        .shouldRenderActivity({
          id: 4,
          date: 'Thursday 3 September 2020',
          time: '10:30am to 11:15am',
          name: 'Office visit',
          notes: LONG_CONTACT_NOTES,
          tags: [
            { colour: 'purple', text: 'rar' },
            { colour: 'red', text: 'unacceptable absence' },
          ],
          havingLongNotes: true,
        })
        .shouldNotRenderActivity({
          id: 1, // a complied attended activity not returned by Wiremocked CAPI when the FTC filters are applied
        })
    })

    it('displays activity log filtered by appointments without an outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingWithoutAnOutcomeFilter()
        .shouldRenderActivity({
          id: 5,
          date: 'Wednesday 2 September 2020',
          time: '11am to 1pm',
          name: 'Not a well known appointment with Robert Ohagan',
          notes: 'Some unknown appointment',
          havingLongNotes: false,
        })
        .shouldNotRenderActivities([1, 2, 3, 4])
    })
  })
})
