import { HmppsAuthPage, HomePage } from '../pages'

context('Home', () => {
  const homePage = new HomePage()
  const authPage = new HmppsAuthPage()

  before(() => {
    cy.seed()
  })

  it('User can log out', () => {
    cy.home()
    homePage.logoutButton.click()
    authPage.shouldHaveRedirectedToLogoutPage()
  })

  it('Page furniture rendered', () => {
    cy.home()
    homePage.pageTitle.contains('This site is under construction...')
    homePage.headerUserName.should('contain.text', 'J. Smith')
  })
})
