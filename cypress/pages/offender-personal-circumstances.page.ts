import { PageBase } from './page'

export class PersonalCircumstanceCard {
  cell(title: string) {
    return cy.get('dl[data-qa="circumstance-summary"] > div > dt').contains(title)
  }

  value(title: string) {
    return this.cell(title).siblings('dd')
  }

  get lastUpdated() {
    return cy.get('[data-qa="circumstance-last-updated"]')
  }
}

export class OffenderPersonalCircumstancesPage extends PageBase {
  circumstance(title: string, callback: (card: PersonalCircumstanceCard) => void) {
    cy.get(`[data-qa="offender/personal-circumstances/circumstance"] h2`)
      .contains(title)
      .parents('[data-qa="offender/personal-circumstances/circumstance"]')
      .within(() => callback(new PersonalCircumstanceCard()))
  }
}
