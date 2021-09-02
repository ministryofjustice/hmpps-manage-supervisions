import { HmppsAuthPage, HomePage } from '../pages'

context('Home', () => {
  const homePage = new HomePage()
  const authPage = new HmppsAuthPage()

  describe('authorized user', () => {
    before(() => {
      cy.seed()
    })

    it('can logout', () => {
      cy.home()
      homePage.logoutButton.click()
      authPage.shouldHaveRedirectedToLogoutPage()
    })

    it('renders page furniture', () => {
      cy.home()
      homePage.pageTitle.contains('This site is under construction...')
      homePage.headerUserName.should('contain.text', 'J. Smith')
    })
  })

  describe('unauthorized user', () => {
    before(() => {
      cy.seed({ roles: ['SOME_ROLE'] })
    })

    it('is unauthorized', () => {
      cy.home()
      homePage.pageTitle.contains('Access denied')
    })
  })
})
