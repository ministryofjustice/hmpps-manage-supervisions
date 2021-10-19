import { ViewCasesFixture } from '../fixtures/view-cases.fixture'
import { HmppsAuthPage, CasesPage } from '../pages'
import { Role } from '../plugins/hmpps-auth'

context('Cases', () => {
  const casesPage = new CasesPage()
  const authPage = new HmppsAuthPage()
  const fixture = new ViewCasesFixture()

  describe('authorized user with cases', () => {
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
      cy.testA11y()
      casesPage.pageTitle.contains('Your cases')
      casesPage.headerUserName.should('contain.text', 'J. Smith')
      casesPage.headerProviderName.should('contain.text', 'NPS Yorkshire and The Humber')
    })

    it('renders case list', () => {
      cy.home()
      fixture.shouldRenderCasesHeader('Name and CRN').shouldRenderCasesRow(0, 'Liz Danger Haggis', 'X009923')
    })
  })

  describe('authorized user with no cases', () => {
    before(() => {
      cy.seed({ cases: [] })
    })

    it('should render the empty list message', () => {
      cy.home()
      fixture.shouldDisplayEmptyWarning('None of the cases you manage meet the criteria for this pilot.')
    })
  })

  describe('unauthorized user', () => {
    before(() => {
      cy.seed({ role: Role.None })
    })

    it('is unauthorized', () => {
      cy.home()
      casesPage.pageTitle.contains('Your Delius account needs permission')
    })
  })
  describe('non delius user', () => {
    before(() => {
      cy.seed({ auth_source: 'notDelius' })
    })

    it('is unauthorized', () => {
      cy.home()
      casesPage.pageTitle.contains('You need a Delius account')
    })
  })
})
