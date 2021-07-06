import { ViewOffenderFixture } from './view-offender.fixture'

context('ViewOffenderSentence', () => {
  const fixture = new ViewOffenderFixture()

  beforeEach(() => fixture.reset())

  it('displays sentence details', () => {
    fixture
      .havingOffender({ convictions: { previous: true } })

      .whenViewingOffender()
      .whenClickingSubNavTab('sentence')

      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('sentence', page => {
        page
          .mainOffence('Main offence')
          .contains('Cheats at gambling or enables or assists person to cheat (Gambling Act 2005) - 07539')
        page.mainOffence('Offence date').contains('1 February 2021')
        page.additionalOffence('M2500297061', 'Additional offence').contains('Assault on Police Officer - 10400')
        page.additionalOffence('M2500297061', 'Offence date').contains('9 September 2019')

        page.details('Sentence').contains('ORA Community Order')
        page.details('Length').contains('12 months')
        page.details('Start date').contains('17 February 2020')
        page.details('End date').contains('16 February 2021')
        page.details('Time elapsed').contains('12 months elapsed (of 12 months)')
        page.details('Conviction date').contains('5 February 2020')
        page.details('Court').contains('Nottingham Crown Court')
        page.details('Responsible court').contains('Sheffield Magistrates Court')

        page.requirements('RAR').contains('20 days')

        page.previous.contains('Previous orders (1) Last ended on 1 December 2020')
      })
  })

  it('displays empty sentence details', () => {
    fixture
      .havingOffender({ convictions: { current: false } })
      .whenViewingOffender()

      .whenClickingSubNavTab('sentence')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('sentence', page => {
        page.noOffences.contains('Offence details are unavailable.')
        page.noDetails.contains('Sentence details are unavailable.')
        page.previous.should('not.exist')
      })
  })
})
