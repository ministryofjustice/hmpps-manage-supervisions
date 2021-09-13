import { ViewCasesFixture } from '../fixtures/view-cases.fixture'
import { HmppsAuthPage, CasesPage } from '../pages'

context('Cases', () => {
  const casesPage = new CasesPage()
  const authPage = new HmppsAuthPage()
  const fixture = new ViewCasesFixture()

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

    it('renders offender list', () => {
      cy.home()
      fixture.shouldRenderCasesHeader('Name and CRN').shouldRenderCasesRow(0, 'Liz Danger Haggis', 'X009923')
    })

    describe('when no cases', () => {
      before(() => {
        cy.seed({ cases: [] })
      })
      it('should render the empty list message', () => {
        cy.home()
        fixture.shouldDisplayEmptyWarning('There are no suitable cases.')
      })
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
