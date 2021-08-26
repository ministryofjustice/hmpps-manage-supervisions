import { SummaryList } from './components/summary-list'
import { PageBase } from './page'

export class OffenderRiskDetailPage extends PageBase {
  registrationDetails(callback: (card: SummaryList) => void) {
    SummaryList.selectFromCard('About this flag', callback)
  }

  removalDetails(callback: (card: SummaryList) => void) {
    SummaryList.selectFromCard('Flag removed', callback)
  }

  beforeItWasRemoved(callback: (card: SummaryList) => void) {
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
