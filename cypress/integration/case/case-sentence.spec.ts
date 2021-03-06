import { ViewCaseFixture } from '../../fixtures/view-case.fixture'
import { CaseOffencesPage } from '../../pages/case/case-offences.page'

class Fixture extends ViewCaseFixture {
  shouldRenderOffencesPage(callback: (page: CaseOffencesPage) => void) {
    const page = new CaseOffencesPage()
    page.pageTitle.contains('Offences')
    callback(page)
    return this
  }
}

context('Case sentence tab', () => {
  const fixture = new Fixture()

  describe('no active conviction', () => {
    before(() => {
      cy.seed({ convictions: { active: null, previous: [] } })
    })

    it('displays empty sentence details', () => {
      fixture
        .whenViewingOffender()

        .whenClickingSubNavTab('sentence')
        .shouldBeAccessible()
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('sentence', page => {
          page.noDetails.contains('Sentence details are unavailable.')
        })
    })
  })

  describe('with active conviction', () => {
    before(() => {
      cy.seed({
        convictions: {
          active: {
            conviction: { inBreach: false },
            nsis: [],
          },
          previous: [
            {
              nsis: [
                {
                  active: false,
                  nsiType: { code: 'BRE' },
                  actualStartDate: '2018-12-10',
                  actualEndDate: '2019-12-03',
                },
              ],
            },
          ],
        },
        contacts: [
          {
            date: '2018-12-11',
            rarDay: false,
            entries: [
              {
                startTime: '12:00:00',
                endTime: null,
                type: { code: 'ABCF', appointment: true },
              },
            ],
          },
        ],
      })
    })

    it('displays sentence details', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('sentence')

        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('sentence', page => {
          page.offence(card => {
            card
              .value('Main offence')
              .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)')
            card.value('Category').contains('Betting, Gaming and Lotteries (Indictable)')
            card.value('Offence date').contains('1 February 2021')
            card.value('Additional offences').contains('Assault on Police Officer (1 count)')
          })

          page.conviction(card => {
            card.value('Sentencing court').contains('Nottingham Crown Court')
            card.value('Responsible court').contains('Sheffield Magistrates Court')
            card.value('Conviction date').contains('5 February 2020')
            card.detailsList('Additional sentences', 'Fine', list => {
              list.value('Sentence').contains('Fine')
              list.value('Value').contains('500')
              list.value('Notes').contains('??500 fine')
              list.value('Notes').contains('a', 'https://gov.uk')
            })
            card.detailsList('Additional sentences', 'Disqualified from Driving', list => {
              list.value('Sentence').contains('Disqualified from Driving')
              list.value('Length').contains('6')
              list.value('Notes').contains('No notes')
            })
          })

          page.sentence(card => {
            card.value('Order').contains('12 month Community Order')
            card.detailsList('Requirements', '44 days RAR, 1 completed', list => {
              list.value('Length').contains('34 days')
              list.value('Start date').contains('1 August 2018')
              list.value('Termination date').contains('7 November 2021 (expected)')
              list.value('Notes').contains('This is a requirement note')
              list.value('Notes').contains('a', 'https://gov.uk')
            })
            card.value('Start date').contains('17 February 2020')
            card.value('Expected end date').contains('16 February 2021')
            card.value('Time elapsed').contains('12 months elapsed (of 12 months)')
          })

          page.probationHistory(card => {
            card.value('Previous orders').contains('1 previous order Last ended on 1 December 2020')
            card.value('Previous breaches').contains('1 previous breach')
          })
        })
        .shouldBeAccessible()
    })

    it('displays previous convictions details', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('sentence')
        .shouldRenderOffenderTab('sentence', page => {
          page.probationHistory(card => {
            card.value('Previous orders').contains('1 previous order').click()
          })
        })
        .shouldBeAccessible()
        .shouldRenderPreviousOrdersPage(page => {
          page.previousOrdersTable(table => {
            table.cell(0, 1).contains('Ended on 1 December 2020')
            table.cell(0, 0).contains('Assault on Police Officer (2 counts)')
            table.cell(0, 0).contains('24 month Community Order').click()
          })
        })
        .shouldDisplayExitPage('delius')
    })

    it('displays additional offence detaiils', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('sentence')
        .shouldRenderOffenderTab('sentence', page => {
          page.offence(list => {
            list.value('Additional offences').find('a').contains('View additional offence details').click()
          })
        })
        .shouldBeAccessible()
        .shouldRenderOffencesPage(page => {
          page.mainOffence(list => {
            list
              .value('Offence')
              .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) (1 count)')
            list.value('Category').contains('Betting, Gaming and Lotteries (Indictable)')
            list.value('Offence date').contains('1 February 2021')
          })
          page.additionalOffence('80701', list => {
            list.value('Offence').contains('Assault on Police Officer (1 count)')
            list.value('Category').contains('Assault on Police Officer')
            list.value('Offence date').contains('9 September 2019')
          })
        })
    })
  })
})
