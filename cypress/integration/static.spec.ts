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

  it('Privacy notice renders correctly', () => {
    cy.home()
    cy.contains('Privacy').click()
    cy.title().should('eq', 'Privacy notice')
    cy.testA11y()
  })
})
