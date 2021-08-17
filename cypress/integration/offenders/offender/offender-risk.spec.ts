import { ViewOffenderFixture } from './view-offender.fixture'

class Fixture extends ViewOffenderFixture {}

context('ViewOffenderPersonalDetails', () => {
  const fixture = new Fixture()

  before(() => cy.seed())

  it('displays risk', () => {
    fixture
      .whenViewingOffender()
      .whenClickingSubNavTab('risk')
      .shouldDisplayCommonHeader()
      .shouldRenderOffenderTab('risk', page => {
        page.rosh(card => {
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
