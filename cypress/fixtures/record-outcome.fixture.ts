import { RecordOutcomePage } from '../pages/record-outcome.page'
import { CRN } from '../plugins/offender'

export class RecordOutcomeFixture {
  readonly page = new RecordOutcomePage()

  constructor(private readonly data: { crn: string; id: number } = { crn: CRN, id: 5 }) {}

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
    this.page.landingPageContinueButton.click()
    return this
  }

  whenSubmittingCurrentStep() {
    this.page.continueButton.click()
    return this
  }

  shouldDisplayCompliancePage(title: string) {
    this.page.pageTitle.contains(title)
    return this
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

  shouldDisplayOutcomePage(title: string) {
    this.page.pageTitle.contains(title)
    this.page.outcome.outcomeRadios.should('exist')
    return this
  }

  whenSelectingOutcome(option: string) {
    this.page.outcome.radio(option).click()
    return this
  }
}
