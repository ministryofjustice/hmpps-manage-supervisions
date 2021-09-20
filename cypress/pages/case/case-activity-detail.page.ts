import { PageBase } from '../page'
import { SummaryList, SummaryListCallback } from '../components/summary-list'

export class CaseActivityDetailPage extends PageBase {
  detail(callback: SummaryListCallback) {
    SummaryList.selectFromQa('offender/activity/detail', callback)
  }

  get lastUpdated() {
    return cy.get('[data-qa="contact-last-updated"]')
  }
}
