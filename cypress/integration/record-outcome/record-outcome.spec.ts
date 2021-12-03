import { RecordOutcomeFixture } from '../../fixtures/record-outcome.fixture'

context('Record outcome happy path & validation', () => {
  before(() => {
    cy.seed()
  })

  it('cannot record outcome when counts towards rar', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSelectingCompliedOption()
      .whenSubmittingCurrentStep()
      .shouldDisplayRarStep(page => page.radio('Yes').click())
      .whenSubmittingCurrentStep()
      .shouldRedirectToRarUnavailablePage()
  })

  it('can record outcome - complied & attended', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSelectingCompliedOption()
      .whenSubmittingCurrentStep()
      .shouldDisplayRarStep()
      .whenSubmittingCurrentStep()
      .shouldDisplayRarStep(page => {
        page.errorMessages.isRar.contains('Select yes if this appointment counted towards RAR')
        page.radio('No').click()
      })
      .whenSubmittingCurrentStep()
      .shouldDisplayAddNotesPage()
      .whenSelectingAddNotesOption('No')
      .whenSubmittingCurrentStep()
      .shouldDisplaySensitiveInformationPage()
      .whenSelectingIsSensitiveOption('No')
      .whenSubmittingCurrentStep()
    // TODO complete this once record outcome implemented
  })

  it('can record outcome - failed to comply', () => {
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
      .shouldDisplayCompliancePage()
      .whenSelectingNonComplianceOption()
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('outcome', 'How did Liz not comply?')
      .whenSelectingOutcome('Failed to comply')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('enforcement', 'Pick an enforcement action')
      .whenSubmittingCurrentStep()
      // testing the validation
      .shouldDisplayEnforcementErrors('There is a problem', 'Select an enforcement')
      .whenSelectingEnforcementAction('Refer to Offender Manager')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('add-notes', 'Do you want to add notes to this appointment?', page => {
        page.addNotesRadios.should('exist')
      })
      .whenSelectingAddNotesOption('Yes')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('notes', 'Add appointment notes')
      .whenTypingNotesContent('Some notes')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('sensitive', 'Does this appointment include sensitive information?')
      .whenSelectingIsSensitiveOption('No')
      .whenSubmittingCurrentStep()
      .shouldDisplayCheckPage({
        crn: 'X009923',
        appointmentId: 5,
        compliance: 'No',
        notes: 'Some notes',
        enforcement: 'Refer to Offender Manager',
        outcome: 'Attended - Failed to Comply',
        sensitive: 'No',
      })
      .whenSubmittingCurrentStep()
      .shouldDisplayRecordOutcomeConfirmation(
        'Outcome of appointment recorded',
        'Not a well known appointment with Robert Ohagan',
        'Wednesday 2 September 2020 from 11am to 1pm',
        'activity',
      )
  })

  it('can record outcome - failed to attend', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSelectingComplianceFailedToAttendOutcome()
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('failed-to-attend', 'Was Liz’s absence acceptable?', page => {
        page.absenceRadios.should('exist')
      })
      .whenSelectingAbsenceAcceptable('No')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('outcome', 'Why was Liz absent?', page => {
        page.outcomeRadios.should('exist')
      })
      .whenSelectingOutcome('Failed to attend')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('enforcement', 'Pick an enforcement action')
      .whenSelectingEnforcementAction('Refer to Offender Manager')
      .whenSubmittingCurrentStep()
      .whenSubmittingCurrentStep()
      .shouldDisplayAddNotesErrors('There is a problem', 'Select yes if you would like to add notes')
      .whenSelectingAddNotesOption('Yes')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('notes', 'Add appointment notes')
      .whenTypingNotesContent('Some notes')
      .whenSubmittingCurrentStep()
      .shouldDisplaySensitiveInformationPage()
      .whenSubmittingCurrentStep()
      .shouldDisplaySensitiveInformationErrors(
        'There is a problem',
        'Select yes if the appointment contains sensitive information',
      )
      .whenSelectingIsSensitiveOption('Yes')
      .whenSubmittingCurrentStep()
      .shouldDisplayCheckPage({
        crn: 'X009923',
        appointmentId: 5,
        compliance: 'Unacceptable absence',
        notes: 'Some notes',
        enforcement: 'Refer to Offender Manager',
        outcome: 'Failed to Attend',
        sensitive: 'Yes',
      })
      .whenSubmittingCurrentStep()
      .shouldDisplayRecordOutcomeConfirmation(
        'Outcome of appointment recorded',
        'Not a well known appointment with Robert Ohagan',
        'Wednesday 2 September 2020 from 11am to 1pm',
        'activity',
      )
  })

  it('compliance page validation', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSubmittingCurrentStep()
      .shouldDisplayComplianceErrors('There is a problem', 'Select one of the compliance options')
  })

  it('failed-to-attend page validation', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSelectingComplianceFailedToAttendOutcome()
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('failed-to-attend', 'Was Liz’s absence acceptable?')
      .whenSubmittingCurrentStep()
      .shouldDisplayFailedToAttendErrors('There is a problem', 'Select one of the absence options')
  })

  it('outcome page validation', () => {
    new RecordOutcomeFixture()
      .whenRecordingOutcome()
      .whenSubmittingFirstStep()
      .shouldDisplayCompliancePage()
      .whenSelectingComplianceFailedToAttendOutcome()
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('failed-to-attend', 'Was Liz’s absence acceptable?')
      .whenSelectingAbsenceAcceptable('Yes')
      .whenSubmittingCurrentStep()
      .shouldDisplayStep('outcome', 'Why was Liz absent?')
      .whenSubmittingCurrentStep()
      .shouldDisplayOutcomeErrors('There is a problem', 'Select an outcome')
  })
})
