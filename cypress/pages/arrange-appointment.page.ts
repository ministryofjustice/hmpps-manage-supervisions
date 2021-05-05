import { PageBase } from './page'

/**
 * TODO this needs splitting up into steps somehow, preferably via a fluent api
 */
export class ArrangeAppointmentPage extends PageBase {
  get appointmentSummaryTable() {
    return cy.get('dl[data-qa="arrange-appointment/details"] div >')
  }

  get continueButton() {
    return cy.get('button[data-qa="arrange-appointment/continue-button"]')
  }
}
