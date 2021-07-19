import { HmppsAuthPage } from '../pages'

const hmppsAuth = new HmppsAuthPage()

Cypress.Commands.add('home', () => {
  cy.visit('/')
  hmppsAuth.login()
})

Cypress.Commands.add('arrangeAppointment', (crn: string) => {
  cy.visit(`/arrange-appointment/${crn}`)
  hmppsAuth.login()
})

Cypress.Commands.add('viewOffender', (crn: string) => {
  cy.visit(`/offender/${crn}`)
  hmppsAuth.login()
})
