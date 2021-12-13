import { CRN } from '../plugins/offender'
import { UpdateEnforcementPage } from '../pages/update-enforcement.page'
import { CaseActivityAppointmentPage } from '../pages'

export class UpdateEnforcementFixture {
  readonly page = new UpdateEnforcementPage()

  constructor(readonly data: { crn: string; appointmentId: number } = { crn: CRN, appointmentId: 4 }) {}

  whenViewingAppointmentAndUpdatingEnforcement() {
    cy.viewCase({ crn: this.data.crn, path: `/activity/appointment/${this.data.appointmentId}` })
    const page = new CaseActivityAppointmentPage()
    page.outcome(list => list.actions('Enforcement action').contains('Change').click())
    return this
  }

  shouldDisplayChangeEnforcementPage() {
    this.page.pageTitle.contains('Change enforcement action')
    this.page.documentTitle.contains('Change enforcement action')
    return this
  }

  whenSelectingEnforcement(value: string) {
    this.page.enforcement.select(value)
    this.page.continueButton.click()
    return this
  }

  shouldDisplaySuccessMessage(message: string) {
    this.page.notifications.contains(message)
    return this
  }
}
