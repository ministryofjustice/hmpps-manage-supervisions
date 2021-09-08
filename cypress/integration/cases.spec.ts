import { HmppsAuthPage, CasesPage } from '../pages'

context('Cases', () => {
  const casesPage = new CasesPage()
  const authPage = new HmppsAuthPage()

  describe('authorized user', () => {
    before(() => {
      cy.seed()
    })

    it('can logout', () => {
      cy.home()
      casesPage.logoutButton.click()
      authPage.shouldHaveRedirectedToLogoutPage()
    })

    it('renders page furniture', () => {
      cy.home()
      casesPage.pageTitle.contains('Your cases')
      casesPage.headerUserName.should('contain.text', 'J. Smith')
    })
  })

  describe('unauthorized user', () => {
    before(() => {
      cy.seed({ roles: ['SOME_ROLE'] })
    })

    it('is unauthorized', () => {
      cy.home()
      casesPage.pageTitle.contains('Access denied')
    })
  })
})
