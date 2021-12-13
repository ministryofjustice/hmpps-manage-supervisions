export abstract class PageBase {
  get documentTitle() {
    return cy.get('title')
  }

  get pageTitle() {
    return cy.get('h1')
  }

  get logoutButton() {
    return cy.get('[data-qa=logout]')
  }

  get currentBreadcrumb() {
    return cy.get('.govuk-breadcrumbs [aria-current]')
  }

  get notifications() {
    return cy.get('[data-qa="global/notification"]')
  }
}
