export abstract class PageBase {
  get pageTitle() {
    return cy.get('h1')
  }

  get logoutButton() {
    return cy.get('[data-qa=logout]')
  }
}
