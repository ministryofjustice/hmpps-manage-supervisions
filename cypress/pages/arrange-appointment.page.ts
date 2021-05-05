import { PageBase } from './page'
import { chunk } from 'lodash'
import Chainable = Cypress.Chainable

/**
 * TODO this needs splitting up into steps somehow, preferably via a fluent api
 */
export class ArrangeAppointmentPage extends PageBase {
  get appointmentSummaryTable(): Chainable<any> {
    return cy.get('dl[data-qa="arrange-appointment/details"] div >').then($el => {
      const text = $el.map((i, x) => x.innerText).toArray()
      return chunk(text, 2).reduce((agg, [k, v]) => ({ ...agg, [k]: v }), {})
    })
  }

  get continueButton() {
    return cy.get('button[data-qa="arrange-appointment/continue-button"]')
  }
}
