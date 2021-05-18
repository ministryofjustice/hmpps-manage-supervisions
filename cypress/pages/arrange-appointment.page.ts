import { PageBase } from './page'
import { chunk } from 'lodash'
import Chainable = Cypress.Chainable

export class ArrangeAppointmentPage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="arrange-appointment/continue-button"]')
  }

  get type() {
    return {
      radio(name: string) {
        return cy
          .get(`[data-qa="arrange-appointment/featured-type"] input[type=radio]`)
          .siblings('label')
          .contains(name)
      },

      get otherAutoComplete() {
        return cy.get('#arrange-appointment-other-select')
      },

      autoCompleteResult(name: string) {
        return cy.get('#arrange-appointment-other-select__listbox > li').contains(name)
      },

      get errorMessages() {
        return {
          get type() {
            return cy.get('#type-error')
          },

          get other() {
            return cy.get('#arrange-appointment-other-select-error')
          },
        }
      },
    }
  }

  get when() {
    return {
      get dayField() {
        return cy.get('input[name="startDate[day]"]')
      },

      get monthField() {
        return cy.get('input[name="startDate[month]"]')
      },

      get yearField() {
        return cy.get('input[name="startDate[year]"]')
      },

      get startTimeField() {
        return cy.get('input[name="startTime"]')
      },

      get endTimeField() {
        return cy.get('input[name="endTime"]')
      },

      get startTimeErrorMessage() {
        return cy.get('#startTime-error')
      },

      get endTimeErrorMessage() {
        return cy.get('#endTime-error')
      },

      get dateErrorMessage() {
        return cy.get('#session-date-error')
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
