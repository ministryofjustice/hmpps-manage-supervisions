import { PageBase } from './page'

export class CasesPage extends PageBase {
  get headerUserName() {
    return cy.get('[data-qa=header-user-name]')
  }
}
