import { PageBase } from '../page'

export class CasePersonalContactPage extends PageBase {
  cell(title: string | RegExp) {
    return cy.get('dl[data-qa="offender/personal-contact/contact"] > div > dt').contains(title)
  }

  value(title: string | RegExp) {
    return this.cell(title).siblings('dd')
  }

  get changeContactDetailsLink() {
    return cy.get('a').contains('Change contact details')
  }
}
