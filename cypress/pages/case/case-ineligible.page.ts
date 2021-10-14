import { PageBase } from '../page'

export class CaseIneligiblePage extends PageBase {
  get continueButton() {
    return cy.get('[data-qa="ineligible-case-warning/continue"]')
  }
}
