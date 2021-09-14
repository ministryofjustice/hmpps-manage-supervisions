export class Tag {
  static byNameAndColour(name: string, colour: string) {
    cy.get('.govuk-tag').contains(name).should('have.class', `govuk-tag--${colour}`)
  }
}
