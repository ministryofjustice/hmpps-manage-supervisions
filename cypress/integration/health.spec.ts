context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPing')
  })

  it('Health check api reports as healthy', () => {
    cy.request('/health').its('body.healthy').should('equal', true)
  })

  it('Health check ping api reports as UP', () => {
    cy.request('/health/ping').its('body.status').should('equal', 'UP')
  })
})
