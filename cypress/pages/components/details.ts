export type DetailsCallback = (details: Details) => void

export class Details {
  get text() {
    return cy.get('.govuk-details__text')
  }

  shouldBeOpen() {
    this.text.should('be.visible')
  }

  shouldBeClosed() {
    this.text.should('not.be.visible')
  }

  get summary() {
    return cy.get('summary')
  }

  toggle() {
    this.summary.click()
  }

  static byName(name: string, callback: DetailsCallback) {
    cy.get('details')
      .contains(name)
      .parents('details')
      .within(() => callback(new Details()))
  }
}
