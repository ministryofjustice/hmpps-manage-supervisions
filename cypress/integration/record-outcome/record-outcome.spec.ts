import { RecordOutcomePage } from '../../pages/record-outcome.page'
import { CRN } from '../../plugins/offender'

class Fixture {
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
  whenSubmittingFirstStep() {
    this.page.landingPageContinueButton.click()
    return this
  }
  shouldDisplayCompliancePage(title: string) {
    this.page.pageTitle.contains(title)
    return this
  }
}

context('Record outcome happy path & validation', () => {
  before(() => {
    cy.seed()
  })

  it('can record outcome (TODO upto init so far)', () => {
    new Fixture()
      .whenRecordingOutcome()
      .shouldDisplayStep('init', 'Record an outcome', page => {
        page.appointmentDetails.contains('Not a well known appointment with Robert Ohagan')
        page.appointmentDetails.contains('Wednesday 2 September 2020 from 11am to 1pm')
        page.appointmentDetails.find('a').contains('View appointment').click()
      })
      .shouldDisplayAppointmentPage('Not a well known appointment with Robert Ohagan')
  })

  it('should record outcome ', () => {
    new Fixture().whenRecordingOutcome().whenSubmittingFirstStep().shouldDisplayCompliancePage('attend and comply?')
  })
})
