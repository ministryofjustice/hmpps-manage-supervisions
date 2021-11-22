import { PageBase } from './page'

export class RecordOutcomePage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="wizard/continue-button"]')
  }
  get landingPageContinueButton() {
    return cy.get('[data-qa="wizard/continue"]')
  }

  get backLink() {
    return cy.get('.govuk-back-link')
  }

  get errorSummary() {
    return cy.get('#error-summary-title')
  }

  get init() {
    return {
      get appointmentDetails() {
        return cy.get('[data-qa="record-outcome/appointment-details"]')
      },
    }
  }

  get compliance() {
    return {
      get errorMessages() {
        return {
          get compliance() {
            return cy.get('#compliance-error')
          },
        }
      },
      get compliedNo() {
        return cy.get('#complied-no')
      },
    }
  }

  get outcome() {
    return {
      get outcomeRadios() {
        return cy.get('[data-qa="record-outcome/outcome"]')
      },
      radio(name: string) {
        return cy.get('[data-qa="record-outcome/outcome"] input[type=radio]').siblings('label').contains(name)
      },
    }
  }
}
