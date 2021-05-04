import { PageBase } from './page'

export class HomePage extends PageBase {
  get headerUserName() {
    return cy.get('[data-qa=header-user-name]')
  }
}
