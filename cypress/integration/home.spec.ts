import { HomePage } from '../pages'

context('Home', () => {
  const homePage = new HomePage()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to login', () => {
    cy.home()
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('User can log out', () => {
    cy.login()
    cy.home()
    homePage.logoutButton.click()
    cy.task('getLogoutAttempts').should('have.length', 1)
  })

  it('Page furniture rendered', () => {
    cy.login()
    cy.home()
    homePage.pageTitle.contains('This site is under construction...')
    homePage.headerUserName.should('contain.text', 'J. Smith')
  })
})
