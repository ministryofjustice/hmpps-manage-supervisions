import { RecordOutcomePage } from '../pages/record-outcome.page'
import { CRN } from '../plugins/offender'

export class RecordOutcomeFixture {
  readonly page = new RecordOutcomePage()

  constructor(
    private readonly data: { crn: string; id: number; firstName: string } = { crn: CRN, id: 5, firstName: 'Liz' },
  ) {}

  whenRecordingOutcome() {
    cy.recordOutcome(this.data)
    return this
  }

  shouldDisplayStep<Step extends keyof RecordOutcomePage>(
    step: Step,
    title: string,
    callback?: (page: RecordOutcomePage[Step]) => void,
  ) {
    this.page.pageTitle.contains(title)
    cy.url().should(
      'include',
      `/case/${this.data.crn}/appointment/${this.data.id}/record-outcome${step === 'init' ? '' : '/' + step}`,
    )
    callback && callback(this.page[step])
    return this
  }

  shouldDisplayAppointmentPage(name: string) {
    this.page.pageTitle.contains(name)
    return this
  }

  whenGoingBack() {
    cy.go('back')
    return this
  }

  whenSubmittingFirstStep() {
    this.page.pageTitle.contains('Record an outcome')
    this.page.landingPageContinueButton.click()
    return this
  }

  whenSubmittingCurrentStep() {
    this.page.continueButton.click()
    return this
  }

  shouldDisplayCompliancePage() {
    this.page.pageTitle.contains(`Did ${this.data.firstName} attend and comply?`)
    return this
  }

  shouldDisplayRarStep(callback?: (page: RecordOutcomePage['rar']) => void) {
    return this.shouldDisplayStep('rar', 'Did this appointment count towards RAR?', callback)
  }

  shouldRedirectToRarUnavailablePage() {
    this.page.pageTitle.contains('You need to record this outcome on National Delius')
    this.page.documentTitle.contains('You need to record this outcome on National Delius')
  }

  shouldDisplayComplianceErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page.compliance.errorMessages.compliance.contains(error)
    return this
  }

  whenSelectingNonComplianceOption() {
    this.page.compliance.compliedNo.click()
    return this
  }

  whenSelectingCompliedOption() {
    this.page.compliance.compliedYes.click()
    return this
  }

  whenSelectingComplianceFailedToAttendOutcome() {
    this.page.compliance.compliedNoFailedToAttend.click()
    return this
  }

  shouldDisplayFailedToAttendErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page['failed-to-attend'].errorMessages.acceptableAbsence.contains(error)
    return this
  }

  shouldDisplayOutcomeErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page.outcome.errorMessages.outcome.contains(error)
    return this
  }

  whenSelectingAbsenceAcceptable(yesNo: string) {
    yesNo === 'Yes' ? this.page['failed-to-attend'].yes.click() : this.page['failed-to-attend'].no.click()
    return this
  }
  whenSelectingOutcome(option: string) {
    this.page.outcome.radio(option).click()
    return this
  }

  shouldDisplayEnforcementErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page.enforcement.errorMessages.enforcement.contains(error)
    return this
  }

  whenSelectingEnforcementAction(option: string) {
    this.page.enforcement.select(option)
    return this
  }

  shouldDisplayAddNotesPage() {
    this.page.pageTitle.contains('Do you want to add notes to this appointment?')
    return this
  }

  shouldDisplayAddNotesErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page['add-notes'].errorMessages.addNotes.contains(error)
    return this
  }

  whenSelectingAddNotesOption(yesNo: string) {
    yesNo === 'Yes' ? this.page['add-notes'].yes.click() : this.page['add-notes'].no.click()
    return this
  }

  whenTypingNotesContent(notes: string) {
    this.page.notes.notesTextField.type(notes)
    return this
  }

  shouldDisplaySensitiveInformationPage() {
    this.page.pageTitle.contains('Does this appointment include sensitive information?')
    return this
  }

  shouldDisplaySensitiveInformationErrors(summary: string, error: string) {
    this.page.errorSummary.contains(summary)
    this.page.sensitive.errorMessages.sensitive.contains(error)
    return this
  }

  whenSelectingIsSensitiveOption(yesNo: string) {
    yesNo === 'Yes' ? this.page.sensitive.yes.click() : this.page.sensitive.no.click()
    return this
  }

  shouldDisplayCheckPage({ appointmentId, compliance, notes, sensitive, outcome, enforcement, crn }) {
    this.page.pageTitle.contains('Check your answers and record the outcome')

    this.page.check.compliance.contains(compliance)
    this.page.check.complianceChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/appointment/${appointmentId}/record-outcome/compliance`)

    this.page.check.outcome.contains(outcome)
    this.page.check.outcomeChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/appointment/${appointmentId}/record-outcome/outcome`)

    this.page.check.enforcement.contains(enforcement)
    this.page.check.enforcementChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/appointment/${appointmentId}/record-outcome/enforcement`)

    this.page.check.notes.contains(notes)
    this.page.check.notesChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/appointment/${appointmentId}/record-outcome/notes`)

    this.page.check.sensitive.contains(sensitive === 'Yes' ? 'Yes' : 'No')
    this.page.check.sensitiveChangeLink
      .should('have.attr', 'href')
      .and('include', `${crn}/appointment/${appointmentId}/record-outcome/sensitive`)
    return this
  }
  shouldDisplayRecordOutcomeConfirmation(title: string, description: string, timeMessage: string, finishLink: string) {
    this.page.pageTitle.contains(title)
    this.page.confirm.descriptionMessage.contains(description)
    this.page.confirm.timeMessage.contains(timeMessage)
    this.page.confirm.finishButton.should('have.attr', 'href').and('include', `/${finishLink}`)
    return this
  }
}
