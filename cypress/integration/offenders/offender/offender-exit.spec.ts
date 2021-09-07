import { ViewOffenderFixture } from './view-offender.fixture'
import { OFFENDER_ID } from '../../../plugins/offender'
import { ACTIVE_CONVICTION_ID } from '../../../plugins/convictions'
import { ExitPageName } from '../../../pages/exit.page'

class Fixture extends ViewOffenderFixture {
  whenViewingExitPage(service: ExitPageName) {
    cy.viewOffender({ crn: this.crn, path: `/to-${service}` })
    return this
  }

  shouldRenderOffenderDetails(service: ExitPageName) {
    return this.shouldDisplayExitPage(service, page => {
      page.offenderDetails(list => {
        list.value('Name').contains('Liz Danger Haggis')
        list.value('Date of birth').contains('10/06/1980')
        list.value('CRN').contains(this.crn)
        list.value('PNC').contains('2012/123400000F')
      })
    })
  }
}

describe('Offender exit', () => {
  const fixture = new Fixture()

  before(() => cy.seed())

  it('renders delius exit page', () => {
    fixture
      .whenViewingExitPage('delius')
      .shouldDisplayExitPage('delius', page => {
        page.delius.contactLogTitle.contains('Go directly to Liz Haggis on Delius')
        page.delius.contactLog
          .contains('Open Liz Haggis’s contact log on Delius')
          .should('have.attr', 'href')
          .and(
            'include',
            `http://localhost:8082/NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=${OFFENDER_ID}&eventId=${ACTIVE_CONVICTION_ID}`,
          )

        page.delius.homepageExplanation.contains(
          'Or you can use the following information to find Liz Haggis on Delius',
        )
        page.delius.homepage
          .contains('Open the Delius homepage')
          .should('have.attr', 'href')
          .and('include', 'http://localhost:8082/NDelius-war/delius/JSP/homepage.jsp')
      })
      .shouldRenderOffenderDetails('delius')
  })

  it('renders oasys exit page', () => {
    fixture
      .whenViewingExitPage('oasys')
      .shouldDisplayExitPage('oasys', page => {
        page.oasys.homepageExplanation.contains('You can use the following information to find Liz Haggis on OASys')
        page.oasys.homepage
          .contains('Open the OASys homepage')
          .should('have.attr', 'href')
          .and('include', 'http://localhost:8082/oasys')
      })
      .shouldRenderOffenderDetails('oasys')
  })
})
