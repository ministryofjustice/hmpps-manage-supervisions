import { ViewOffenderFixture } from './view-offender.fixture'
import { OFFENDER_ID } from '../../../plugins/offender'
import { ACTIVE_CONVICTION_ID } from '../../../plugins/convictions'

class Fixture extends ViewOffenderFixture {
  whenViewingDeliusInterstitial() {
    cy.viewOffender({ crn: this.crn, path: '/to-delius' })
    return this
  }
}

describe('Delius interstitial', () => {
  const fixture = new Fixture()

  it('renders all interstitial links & content', () => {
    fixture.whenViewingDeliusInterstitial().shouldDisplayDeliusExitPage(page => {
      page.contactLog
        .contains('Open Liz Haggis’s contact log on Delius')
        .should('have.attr', 'href')
        .and(
          'include',
          `http://localhost:8082/NDelius-war/delius/JSP/deeplink.jsp?component=ContactList&offenderId=${OFFENDER_ID}&eventId=${ACTIVE_CONVICTION_ID}`,
        )

      page.homepage
        .contains('Open the Delius homepage')
        .should('have.attr', 'href')
        .and('include', 'http://localhost:8082/NDelius-war/delius/JSP/homepage.jsp')

      page.offenderDetails(list => {
        list.value('Name').contains('Liz Danger Haggis')
        list.value('Date of birth').contains('10/06/1980')
        list.value('CRN').contains(fixture.crn)
        list.value('PNC').contains('2012/123400000F')
      })
    })
  })
})
