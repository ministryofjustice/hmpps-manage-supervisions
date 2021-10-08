context('Healthcheck', () => {
  before(() => {
    cy.resetSeed()
  })

  it('Health check api reports as healthy', () => {
    cy.request('/health')
      .its('body')
      .should(health => {
        expect(health.healthy).to.be.true
        expect(health.services.community.isError).to.be.false
        expect(health.services.assessRisksAndNeeds.isError).to.be.false
      })
  })

  it('Health check ping api reports as UP', () => {
    cy.request('/health/ping').its('body.status').should('equal', 'UP')
  })
})
