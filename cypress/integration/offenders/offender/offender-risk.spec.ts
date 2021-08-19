import { ViewOffenderFixture } from './view-offender.fixture'

class Fixture extends ViewOffenderFixture {}

context('ViewOffenderPersonalDetails', () => {
  const fixture = new Fixture()

  describe('empty risk page', () => {
    before(() => cy.seed({ risks: null }))

    it('displays no risk assessment warning', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('risk', page => {
          page.noRisksWarning.contains('No risk assessment')
        })
    })
  })

  describe('populated risk page', () => {
    before(() => cy.seed())

    it('displays risk', () => {
      fixture
        .whenViewingOffender()
        .whenClickingSubNavTab('risk')
        .shouldDisplayCommonHeader()
        .shouldRenderOffenderTab('risk', page => {
          page.roshCommunity(card => {
            card.value('Overall').contains('Very high risk of serious harm')
            card.value('Very high risk').contains('Children Staff')
            card.value('High risk').contains('Public')
            card.title('Medium risk').should('not.exist')
            card.value('Low risk').contains('Known Adult')
            card.value('Who is at risk').contains('Someone at risk')
            card.value('Nature of risk').contains('Some nature of risk')
            card.value('When is risk greatest').contains('Some risk imminence')
          })

          page.roshThemselves(card => {
            card.value('Risk of suicide or self harm').contains('There are concerns about self-harm and suicide')
            card.details(
              'Coping in custody or a hostel',
              'There were concerns about coping in a hostel and in custody',
              () => {
                page.currentNotes.contains('No detail given')
                page.previousNotes.contains(
                  'Soluta tempore nemo et velit est perspiciatis. Neque error aut est nemo quasi. Et labore impedit omnis numquam id et eaque facere itaque. Ipsam et atque eos tempora possimus.',
                )
              },
            )
            card.value('Vulnerability').contains('No concerns')
          })
        })
    })
  })
})
