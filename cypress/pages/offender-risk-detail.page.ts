import { SummaryList, SummaryListCallback } from './components/summary-list'
import { PageBase } from './page'
import { Card, CardCallback } from './components/card'

export class OffenderRiskDetailPage extends PageBase {
  registrationDetails(callback: CardCallback) {
    Card.selectByTitle('About this flag', callback)
  }

  removalDetails(callback: SummaryListCallback) {
    SummaryList.selectFromCard('Flag removed', callback)
  }

  beforeItWasRemoved(callback: SummaryListCallback) {
    SummaryList.selectFromCard('Before it was removed', callback)
  }

  get purposeText() {
    return cy.get('p[data-qa="offender-risk-detail/purpose"]')
  }

  get frequencyText() {
    return cy.get('p[data-qa="offender-risk-detail/frequency"]')
  }

  get terminationText() {
    return cy.get('p[data-qa="offender-risk-detail/termination"]')
  }

  get furtherInfoText() {
    return cy.get('p[data-qa="offender-risk-detail/further-info"]')
  }
}
