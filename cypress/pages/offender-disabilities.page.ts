import { PageBase } from './page'

class AdjustmentSummary {
  open() {
    cy.root().should('not.have.attr', 'open')
    cy.get('summary').click()
    cy.root().should('have.attr', 'open')
  }

  cell(title: string) {
    return cy.get('dl dt').contains(title)
  }

  value(title: string) {
    return this.cell(title).siblings('dd')
  }
}

class DisabilityCard {
  cell(title: string) {
    // we have to be this specific to ignore the nested dts
    return cy.get('> div > dt').contains(title)
  }

  value(title: string) {
    return this.cell(title).siblings('dd')
  }

  adjustment(name: string, callback: (subject: AdjustmentSummary) => void) {
    return this.value('Adjustments')
      .find('[data-qa="adjustment"] summary')
      .contains(name)
      .parents('[data-qa="adjustment"]')
      .within(() => callback(new AdjustmentSummary()))
  }
}

export class OffenderDisabilitiesPage extends PageBase {
  disability(name: string, callback: (subject: DisabilityCard) => void) {
    cy.get(`[data-qa="offender/disabilities/disability"] h2`)
      .contains(name)
      .parents('[data-qa="offender/disabilities/disability"]')
      .find('> div > dl') // we have to be this specific to ignore the nested dl
      .within(() => callback(new DisabilityCard()))
  }
}
