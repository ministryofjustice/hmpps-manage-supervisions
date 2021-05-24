import { OffenderPage } from '../../pages/offender.page'

const crn = 'ABC123'

context('ViewOffender', () => {
  const page = new OffenderPage()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('requires authentication', () => {
    cy.viewOffender('somecrn')
    cy.task('getLoginAttempts').should('have.length', 1)
  })

  it('can display offender', () => {
    havingOffender()
    havingLoggedInAndViewedOffender()

    shouldDisplayTab('overview')
    shouldDisplayCommonHeader()
  })

  function havingOffender() {
    cy.task('stubOffenderDetails', crn)
  }

  function havingLoggedInAndViewedOffender() {
    cy.login()
    cy.viewOffender(crn)
  }

  function shouldDisplayTab(tab: 'overview') {
    cy.url().should('include', `/offender/${crn}/${tab}`)
  }

  function shouldDisplayCommonHeader() {
    page.pageTitle.contains(`CRN: ${crn}`)
    page.pageTitle.contains('Beth Cheese')
  }
})
