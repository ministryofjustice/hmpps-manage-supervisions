import { ViewCaseFixture } from '../../fixtures/view-case.fixture'
import { OFFENDER_ID } from '../../plugins/offender'
import { ACTIVE_CONVICTION_ID } from '../../plugins/convictions'
import { ExitPageName } from '../../pages/case/case-exit.page'

class Fixture extends ViewCaseFixture {
  whenViewingExitPage(service: ExitPageName) {
    cy.viewCase({ crn: this.data.crn, path: `/to-${service}` })
    return this
  }

  shouldRenderOffenderDetails(service: ExitPageName) {
    return this.shouldDisplayExitPage(service, page => {
      page.offenderDetails(list => {
        list.value('Name').contains('Liz Danger Haggis')
        list.value('Date of birth').contains('10/06/1980')
        list.valueAbbr('CRN').contains(this.data.crn)
        list.valueAbbr('PNC').contains('2012/123400000F')
      })
    })
  }
}

describe('Case exit pages', () => {
  const fixture = new Fixture()

  before(() => cy.seed())

  it('renders delius exit page', () => {
    fixture
      .whenViewingExitPage('delius')
      .shouldBeAccessible()
      .shouldDisplayExitPage('delius', page => {
        page.delius.contactLogTitle.contains('Go directly to Liz Haggis on Delius')
        page.delius.contactLog
          .contains('Open Liz Haggis’s contact log on Delius')
          .should('have.attr', 'href')
          .and(
            'include',
            `http://localhost:9091/delius/NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=${OFFENDER_ID}&eventId=${ACTIVE_CONVICTION_ID}`,
          )

        page.delius.homepageExplanation.contains(
          'Or you can use the following information to find Liz Haggis on Delius',
        )
        page.delius.homepage
          .contains('Open the Delius homepage')
          .should('have.attr', 'href')
          .and('include', 'http://localhost:9091/delius/NDelius-war/delius/JSP/homepage.jsp')
      })
      .shouldRenderOffenderDetails('delius')
  })

  it('renders oasys exit page', () => {
    fixture
      .whenViewingExitPage('oasys')
      .shouldBeAccessible()
      .shouldDisplayExitPage('oasys', page => {
        page.oasys.homepageExplanation.contains('You can use the following information to find Liz Haggis on OASys')
        page.oasys.homepage
          .contains('Open the OASys homepage')
          .should('have.attr', 'href')
          .and('include', 'http://localhost:9091/oasys')
      })
      .shouldRenderOffenderDetails('oasys')
  })
})
