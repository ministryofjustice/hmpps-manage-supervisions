import { PageBase } from './page'
import { SummaryList, SummaryListCallback } from './components/summary-list'

export class DeliusExitPage extends PageBase {
  get contactLog() {
    return cy.get('a[data-qa="offender/delius-exit/contact-log"]')
  }

  get homepage() {
    return cy.get('a[data-qa="offender/delius-exit/homepage"]')
  }

  offenderDetails(callback: SummaryListCallback) {
    SummaryList.selectFromQa('offender/delius-exit/offender-details', callback)
  }
}
