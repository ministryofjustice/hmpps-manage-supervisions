Cypress.Commands.add('login', () => {
  cy.request('/')
  cy.task<string>('getLoginUrl').then(x => cy.visit(x))
})

Cypress.Commands.add('home', () => cy.visit('/'))

Cypress.Commands.add('arrangeAppointmentStep', (crn: string, step: string) =>
  cy.visit(`/arrange-appointment/${crn}/${step}`),
)
