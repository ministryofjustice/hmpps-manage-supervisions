context('Static pages', () => {
  before(() => {
    cy.seed()
  })

  it('Accessibility statement renders correctly', () => {
    cy.home()
    cy.contains('Accessibility statement').click()
    cy.title().should('eq', 'Accessibility statement')
    cy.testA11y()
  })

  it('Cookies policy renders correctly', () => {
    cy.home()
    cy.contains('Cookies').click()
    cy.title().should('eq', 'Cookies')
    cy.testA11y()
  })
})
