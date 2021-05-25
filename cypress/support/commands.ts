Cypress.Commands.add('login', () => {
  cy.request('/')
  cy.task<string>('getLoginUrl').then(x => cy.visit(x))
})

Cypress.Commands.add('home', () => cy.visit('/'))

Cypress.Commands.add('arrangeAppointment', (crn: string) => cy.visit(`/arrange-appointment/${crn}`))

Cypress.Commands.add('viewOffender', (crn: string) => cy.visit(`/offender/${crn}`))
