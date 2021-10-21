import { PageBase } from './page'
import { DeploymentEnvironment, Env } from '../util'

export class HmppsAuthPage extends PageBase {
  shouldHaveRedirectedToLoginPage() {
    this.pageTitle.contains('Sign in')
  }

  login() {
    this.shouldHaveRedirectedToLoginPage()
    if (Env.deployment === DeploymentEnvironment.Local) {
      cy.get('a').contains('Sign in').click()
    } else {
      cy.get('input[name=username]').type(Env.username)
      cy.get('input[name=password]').type(Env.password)
      cy.get('input[type=submit][value="Sign in"]').click()
    }
  }

  shouldHaveRedirectedToLogoutPage() {
    if (Env.deployment === DeploymentEnvironment.Local) {
      this.pageTitle.contains('HMPPS Auth Logout')
    } else {
      this.shouldHaveRedirectedToLoginPage()
    }
  }
}
