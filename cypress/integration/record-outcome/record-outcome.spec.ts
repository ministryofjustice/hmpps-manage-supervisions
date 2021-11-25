import { RecordOutcomeFixture } from '../../fixtures/record-outcome.fixture'

context('Record outcome happy path & validation', () => {
  before(() => {
    cy.seed()
  })

  it('can record outcome (TODO up to did not comply reason so far)', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .shouldDisplayStep('init', 'Record an outcome', page => {
        page.appointmentDetails.contains('Not a well known appointment with Robert Ohagan')
        page.appointmentDetails.contains('Wednesday 2 September 2020 from 11am to 1pm')
        page.appointmentDetails.find('a').contains('View appointment').click()
      })
      .shouldDisplayAppointmentPage('Not a well known appointment with Robert Ohagan')
      .whenGoingBack()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage('attend and comply?')
      .whenSelectingNonComplianceOption()
      .whenSubmittingCurrentStep()
      .shouldDisplayOutcomePage('How did Liz not comply?')
      .whenSelectingOutcome('Failed to comply')
      .whenSubmittingCurrentStep()
  })

  it('compliance page validation', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage('attend and comply?')
      .whenSubmittingCurrentStep()
      .shouldDisplayComplianceErrors('There is a problem', 'Select one of the compliance options')
  })
})
