import { PageBase } from './page'

export class UpdateEnforcementPage extends PageBase {
  get continueButton() {
    return cy.get('button[data-qa="wizard/continue-button"]')
  }

  get backLink() {
    return cy.get('.govuk-back-link')
  }

  get enforcement() {
    return cy.get('[data-qa="update-enforcement/enforcement"]')
  }
}
