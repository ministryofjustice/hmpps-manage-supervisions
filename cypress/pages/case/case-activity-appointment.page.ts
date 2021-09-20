import { PageBase } from '../page'

export class CaseActivityAppointmentPage extends PageBase {
  detail(title: string) {
    return cy.get('dl[data-qa="offender/activity/appointment"] dt').contains(title).siblings('dd')
  }

  get outcomeTable() {
    return cy.get('dl[data-qa="offender/activity/outcome"]')
  }

  outcome(title: string) {
    return this.outcomeTable.find('dt').contains(title).siblings('dd')
  }
}
