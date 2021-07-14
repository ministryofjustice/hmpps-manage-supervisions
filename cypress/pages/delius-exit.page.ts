import { PageBase } from './page'

export class DeliusExitPage extends PageBase {
  get deliusExitButton() {
    return cy.get('[data-qa="delius-exit/go-to-delius"]')
  }
}
