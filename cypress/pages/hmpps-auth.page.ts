import { PageBase } from './page'

export class HmppsAuthPage extends PageBase {
  shouldHaveRedirectedToLoginPage() {
    this.pageTitle.contains('HMPPS Auth Login')
  }

  login() {
    this.shouldHaveRedirectedToLoginPage()
    cy.get('a').contains('Login').click()
  }

  shouldHaveRedirectedToLogoutPage() {
    this.pageTitle.contains('HMPPS Auth Logout')
  }
}
