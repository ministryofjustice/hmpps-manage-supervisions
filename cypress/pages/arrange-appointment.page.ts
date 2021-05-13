import { PageBase } from './page'
import { chunk } from 'lodash'
import Chainable = Cypress.Chainable

export class ArrangeAppointmentPage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="arrange-appointment/continue-button"]')
  }

  get type() {
    return {
      radio(contactType: string) {
        return cy.get(`[data-qa="arrange-appointment/featured-type"] input[type=radio][value="${contactType}"]`)
      },

      get otherAutoComplete() {
        return cy.get('#arrange-appointment-other-select')
      },

      autoCompleteResult(name: string) {
        return cy.get('#arrange-appointment-other-select__listbox > li').contains(name)
      },
    }
  }

  get check() {
    return {
      get appointmentSummaryTable(): Chainable<any> {
        return cy.get('dl[data-qa="arrange-appointment/details"] div >').then($el => {
          const text = $el.map((i, x) => x.innerText).toArray()
          return chunk(text, 2).reduce((agg, [k, v]) => ({ ...agg, [k]: v }), {})
        })
      },
    }
  }

  get confirm() {
    return {
      get timeMessage() {
        return cy.get('span[data-qa="confirm-appointment/times"]')
      },

      get descriptionMessage() {
        return cy.get('span[data-qa="confirm-appointment/description"]')
      },

      get phoneMessage() {
        return cy.get('span[data-qa="confirm-appointment/phone"]')
      },

      get finishButton() {
        return cy.get('button[data-qa="confirm-appointment/finish-button"]')
      },
    }
  }
}
