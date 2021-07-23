import { ViewOffenderFixture } from './view-offender.fixture'

context('ViewOffenderSentence', () => {
  const fixture = new ViewOffenderFixture()

  beforeEach(() => fixture.reset())

  it('displays empty sentence details', () => {
    fixture
      .havingOffender({ convictions: { current: false } })
      .whenViewingOffender()

      .whenClickingSubNavTab('sentence')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('sentence', page => {
        page.noDetails.contains('Sentence details are unavailable.')
      })
  })

  it('displays sentence details', () => {
    fixture
      .havingOffender({ convictions: { previous: true } })

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
        })

        page.sentence(card => {
          card.value('Order').contains('12 month Community Order')
          card.details('Requirements', '20 days RAR (5 days completed)', list => {
            list.value('Length').contains('20 days')
            list.value('Progress').contains('5 days completed')
            list.value('Start date').contains('3 January 2021')
            list.value('Notes').contains('No notes')
          })
          card.value('Start date').contains('17 February 2020')
          card.value('Expected end date').contains('16 February 2021')
          card.value('Time elapsed').contains('12 months elapsed (of 12 months)')
          card.details('Additional sentences', 'Fine', list => {
            list.value('Sentence').contains('Fine')
            list.value('Value').contains('500')
            list.value('Notes').contains('£500 fine')
          })
          card.details('Additional sentences', 'Disqualified from Driving', list => {
            list.value('Sentence').contains('Disqualified from Driving')
            list.value('Length').contains('6')
            list.value('Notes').contains('No notes')
          })
        })

        page.probationHistory(card => {
          card.value('Previous orders').contains('Previous orders (1) Last ended on 1 December 2020')
        })
      })
  })
})
