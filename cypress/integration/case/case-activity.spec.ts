import { ViewCaseFixture } from './view-case.fixture'
import { CaseActivityAppointmentPage } from '../../pages'
import { LONG_CONTACT_NOTES } from '../../plugins/contacts'
import { CaseActivityDetailPage } from '../../pages/case/case-activity-detail.page'
import { Tag } from '../../pages/components/tag'

interface ExpectedAppointment {
  id: number
  date: string
  title: string
  subTitle?: string
  notes: string
  notesType?: 'plain' | 'closed-detail' | 'open-detail'
  sensitive?: boolean
  action?: string | { colour: string; name: string }
  summary?: Record<string, string>
}

const EXPECTED_LONG_CONTACT_NOTES = LONG_CONTACT_NOTES.replace(/\s+/g, ' ')

class Fixture extends ViewCaseFixture {
  whenClickingActivityEntry(id: number) {
    return this.shouldRenderOffenderTab('activity', page => page.clickEntryLink(id))
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
  whenClickingRarActivityFilter() {
    return this.shouldRenderOffenderTab('activity', page => {
      page.filterLink('rar-activity').click()
    })
  }
  whenClickingSystemContact(id: number) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.entry(id).click()
    })
  }
  shouldRenderActivity({ notesType = 'plain', ...expected }: ExpectedAppointment) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.group(expected.date, group =>
        group.entry(expected.id, entry => {
          entry.title.contains(expected.title)
          if (expected.subTitle) {
            entry.subTitle.contains(expected.subTitle)
          }
          if (typeof expected.action === 'string') {
            entry.actionLinks.contains(expected.action)
          } else if (typeof expected.action === 'object') {
            const { name, colour } = expected.action
            entry.actions.within(() => Tag.byNameAndColour(name, colour))
          }

          entry.notes.contains(expected.notes)

          // only <br> tags should be rendered in the notes field
          entry.notes.find(':not(br)').should('not.exist')

          switch (notesType) {
            case 'closed-detail':
              entry.notesDetail(expected.sensitive, detail => detail.shouldBeClosed())
              break
            case 'open-detail':
              entry.notesDetail(expected.sensitive, detail => detail.shouldBeOpen())
              break
          }

          if (expected.summary) {
            entry.summaryList(list => {
              for (const [k, v] of Object.entries(expected.summary)) {
                list.value(k).contains(v)
              }
            })
          }
        }),
      )
    })
  }

  shouldNotRenderActivityWithId(id: number) {
    return this.shouldRenderOffenderTab('activity', page => page.entry(id).should('not.exist'))
  }

  shouldRenderActivityWithId(id: number) {
    return this.shouldRenderOffenderTab('activity', page => page.entry(id).should('exist'))
  }
  shouldRenderSystemContactWithId(id: number, title: string) {
    return this.shouldRenderOffenderTab('activity', page => {
      page.entry(id).should('exist')
      page.systemContactTitle(id, title)
    })
  }
  shouldRenderAppointmentPage(title: string, assert: (page: CaseActivityAppointmentPage) => void) {
    const page = new CaseActivityAppointmentPage()
    page.pageTitle.contains(title)
    assert(page)
  }

  shouldRenderActivityDetailPage(title: string, assert: (page: CaseActivityDetailPage) => void) {
    const page = new CaseActivityDetailPage()
    page.pageTitle.contains(title)
    assert(page)
    return this
  }

  shouldHaveDocumentTitle(title: string) {
    this.page.documentTitle.contains(title)
    return this
  }

  shouldHaveCurrentBreadcrumb(content: string) {
    this.page.currentBreadcrumb.contains(content)
    return this
  }
}

context('Case activity tab', () => {
  const fixture = new Fixture()

  describe('empty activity log', () => {
    before(() => {
      cy.seed({ contacts: [] })
    })

    it('can add log entry from activity log', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .shouldBeAccessible()
        .shouldHaveDocumentTitle('Activity log')
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
          page.emptyMessage.contains('There has been no activity')
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
          id: 6,
          date: 'Friday 4 September 2020',
          title: 'Phone call from Liz Danger Haggis at 11am',
          notes: 'No notes',
        })

        .shouldRenderActivity({
          id: 1,
          date: 'Friday 4 September 2020',
          title: 'Home visit with Catherine Ellis at 12pm',
          subTitle: 'National standard appointment',
          notes: EXPECTED_LONG_CONTACT_NOTES,
          notesType: 'open-detail', // long, not sensitive & in the first 3 entries
          action: { colour: 'green', name: 'complied' },
        })

        .shouldRenderActivity({
          id: 100,
          date: 'Friday 4 September 2020',
          title: 'Some offender level contact',
          notes: 'No notes',
        })

        .shouldRenderActivity({
          id: 7,
          date: 'Friday 4 September 2020',
          title: 'Email or text message to Liz Danger Haggis at 1pm',
          notes:
            'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00.',
        })

        .shouldRenderActivity({
          id: 8,
          date: 'Friday 4 September 2020',
          title: 'Not a well known communication at 2pm',
          notes: 'Some unknown communication this should not be a link',
          notesType: 'closed-detail',
          sensitive: true,
        })

        .shouldRenderActivity({
          id: 11,
          date: 'Friday 4 September 2020',
          title: 'CPS Package Request',
          notes: 'CPS request',
        })

        .shouldRenderActivity({
          id: 2,
          date: 'Thursday 3 September 2020',
          title: 'Office visit at 10:30am',
          subTitle: 'Appointment',
          notes: 'Some office visit appointment With a new line!',
          action: { colour: 'red', name: 'failed to comply' },
        })

        .shouldRenderActivity({
          id: 3,
          date: 'Thursday 3 September 2020',
          title: 'Office visit at 11am',
          subTitle: 'Appointment',
          notes: EXPECTED_LONG_CONTACT_NOTES,
          notesType: 'closed-detail',
          action: { colour: 'green', name: 'acceptable absence' },
        })

        .shouldRenderActivity({
          id: 4,
          date: 'Thursday 3 September 2020',
          title: 'Office visit at 11:30am',
          subTitle: 'Appointment',
          notes: EXPECTED_LONG_CONTACT_NOTES,
          notesType: 'closed-detail',
          action: { colour: 'red', name: 'unacceptable absence' },
          summary: {
            'RAR activity': 'Attitudes, thinking and behaviour: Racially Motivated Offending',
            'Enforcement action': 'Warning letter requested',
          },
        })

        .shouldRenderActivity({
          id: 5,
          date: 'Wednesday 2 September 2020',
          title: 'Not a well known appointment with Robert Ohagan at 11am',
          subTitle: 'Appointment',
          notes: 'Some unknown appointment',
          summary: { 'RAR activity': 'Finance, benefits and debt' },
        })

        .shouldRenderActivity({
          id: 10,
          date: 'Sunday 5 May 2019',
          title: 'Breach not proven',
          notes: 'No notes',
        })
        .shouldRenderActivity({
          id: 12,
          date: 'Friday 4 September 2020',
          title: 'Letter to Liz Danger Haggis at 1pm',
          notes: 'Letter sent to Liz.',
        })
        .shouldRenderSystemContactWithId(9, 'System generated unknown contact')
    })

    it('displays attendance missing', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .shouldRenderOffenderTab('activity', page => {
          page.group('Wednesday 2 September 2020', group => {
            group.entry(5, card => card.actionLinks.contains('Record an outcome').click())
          })
        })
        .shouldDisplayExitPage('delius')
    })

    it('displays system contact on activity log with link to delius', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingSystemContact(9)
        .shouldDisplayExitPage('delius')
    })

    it('displays appointment detail without outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(5)

        .shouldRenderAppointmentPage('Appointment Not a well known appointment with Robert Ohagan', page => {
          page.detail(list => {
            list.value('Type of appointment').contains('Not a well known appointment')
            list.value('Date').contains('2 September 2020')
            list.value('Time').contains('11am to 1pm')
            list.value('Appointment notes').contains('Some unknown appointment')
            list.value('Sensitive').contains('No')
            list.value('RAR activity').contains('Finance, benefits and debt')
          })

          page.outcomeTable.should('not.exist')
        })
    })

    it('displays appointment detail with outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(1)

        .shouldRenderAppointmentPage('National standard appointment Home visit with Catherine Ellis', page => {
          page.detail(list => {
            list.value('Type of appointment').contains('Home visit')
            list.value('Date').contains('4 September 2020')
            list.value('Time').contains('12pm to 1pm')
            list.title('RAR activity').should('not.exist')
          })

          page.outcome(list => {
            list.value('Complied').contains('Yes')
            list.value('Appointment notes').contains(EXPECTED_LONG_CONTACT_NOTES)
            list.value('Sensitive').contains('No')
          })
        })
    })

    it('displays appointment detail with enforcement action', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(4)

        .shouldRenderAppointmentPage('Office visit', page => {
          page.detail(list => {
            list.value('Type of appointment').contains('Office visit')
            list.value('Date').contains('3 September 2020')
            list.value('Time').contains('11:30am to 12pm')
          })

          page.outcome(list => {
            list.value('Complied').contains('No')
            list.value('Enforcement action').contains('Warning letter requested')
            list.value('Appointment notes').contains(EXPECTED_LONG_CONTACT_NOTES)
            list.value('Sensitive').contains('No')
          })
        })
    })

    it('displays phone call communication detail ', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(6)

        .shouldRenderActivityDetailPage('Phone call from Liz Danger Haggis', page => {
          page.detail(list => {
            list.value('From').contains('Liz Danger Haggis')
            list.title('To').should('not.exist')
            list.value('Date').contains('4 September 2020')
            list.value('Time').contains('11am')
            list.value('Details').contains('No notes')
          })

          page.lastUpdated.contains('Last updated by Andy Smith on Friday 4 September 2020 at 11:20am')
        })
    })

    it('displays email/text communication detail ', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(7)
        .shouldBeAccessible()

        .shouldRenderActivityDetailPage('Email or text message to Liz Danger Haggis', page => {
          page.detail(list => {
            list.title('From').should('not.exist')
            list.value('To').contains('Liz Danger Haggis')
            list.value('Date').contains('4 September 2020')
            list.value('Time').contains('1pm')
            list
              .value('Details')
              .contains(
                'Hi Liz - it was good to speak today. To confirm, your next probation appointment is by telephone on 7th April 2021 at 10:00',
              )
          })

          page.lastUpdated.contains('Last updated by John Smith on Friday 4 September 2020 at 2:20pm')
        })
    })

    it('displays other contact detail ', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingActivityEntry(11)

        .shouldRenderActivityDetailPage('CPS Package Request', page => {
          page.detail(list => {
            list.value('Date').contains('4 September 2020')
            list.value('Notes').contains('CPS request')
          })

          page.lastUpdated.contains('Last updated by John Rover on Friday 4 September 2020 at 3:20pm')
        })
    })

    it('displays activity log filtered to display failure to complies', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingFailuresToComplyFilter()
        .shouldHaveDocumentTitle('Failures to comply')
        .shouldHaveCurrentBreadcrumb('Failures to comply')
        .shouldRenderActivityWithId(2)
        .shouldRenderActivityWithId(4)
        // a complied attended activity not returned by Wiremocked CAPI when the FTC filters are applied
        .shouldNotRenderActivityWithId(1)
        .shouldNotRenderActivityWithId(10)
        .shouldNotRenderActivityWithId(11)
    })

    it('displays activity log filtered by appointments without an outcome', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingWithoutAnOutcomeFilter()
        .shouldHaveDocumentTitle('without an outcome')
        .shouldHaveCurrentBreadcrumb('without an outcome')
        .shouldRenderActivityWithId(5)
        .shouldNotRenderActivityWithId(1)
        .shouldNotRenderActivityWithId(2)
        .shouldNotRenderActivityWithId(3)
        .shouldNotRenderActivityWithId(4)
        .shouldNotRenderActivityWithId(10)
        .shouldNotRenderActivityWithId(11)
    })

    it('displays activity log filtered by rar activity', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('activity')
        .whenClickingRarActivityFilter()
        .shouldHaveDocumentTitle('Appointments with an associated RAR requirement')
        .shouldHaveCurrentBreadcrumb('Appointments with an associated RAR requirement')
        .shouldRenderActivityWithId(4)
        .shouldRenderActivityWithId(5)
        .shouldNotRenderActivityWithId(1)
        .shouldNotRenderActivityWithId(2)
        .shouldNotRenderActivityWithId(3)
        .shouldNotRenderActivityWithId(10)
        .shouldNotRenderActivityWithId(11)
    })
  })
})
