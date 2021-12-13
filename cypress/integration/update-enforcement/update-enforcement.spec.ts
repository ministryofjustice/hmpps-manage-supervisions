import { UpdateEnforcementFixture } from '../../fixtures/update-enforcement.fixture'

context('update enforcement', () => {
  before(() => {
    cy.seed()
  })

  it('updates enforcement', () => {
    new UpdateEnforcementFixture()
      .whenViewingAppointmentAndUpdatingEnforcement()
      .shouldDisplayChangeEnforcementPage()
      .whenSelectingEnforcement('No Further Action')
      .shouldDisplaySuccessMessage('Enforcement action changed')
  })
})
