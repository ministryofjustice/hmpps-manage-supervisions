import { PageBase } from '../page'
import { SummaryList, SummaryListCallback } from '../components/summary-list'

export class CaseActivityAppointmentPage extends PageBase {
  detail(callback: SummaryListCallback) {
    SummaryList.selectFromQa('offender/activity/appointment', callback)
  }

  get outcomeTable() {
    return cy.get('dl[data-qa="offender/activity/outcome"]')
  }

  outcome(callback: SummaryListCallback) {
    SummaryList.selectFromQa('offender/activity/outcome', callback)
  }
}
