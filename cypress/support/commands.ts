import { HmppsAuthPage } from '../pages'
import { CRN } from '../plugins/offender'
import { SeedOptions } from '../plugins'

const hmppsAuth = new HmppsAuthPage()

declare global {
  namespace Cypress {
    interface Chainable {
      resetSeed: typeof resetSeed

      /**
       * Resets the wiremock instance and stubs all data.
       */
      seed: typeof seed

      /**
       * Navigates to home page & logs in.
       */
      home: typeof home

      /**
       * Navigates to arrange an appointment page & logs in.
       */
      arrangeAppointment: typeof arrangeAppointment

      /**
       * Navigates to view case page & logs in.
       */
      viewCase: typeof viewCase
    }
  }
}

function resetSeed() {
  return cy.task('resetSeed')
}
Cypress.Commands.add('resetSeed', resetSeed)

function seed(options: SeedOptions = {}) {
  return cy.task('seed', options)
}
Cypress.Commands.add('seed', seed)

function home() {
  cy.visit('/')
  hmppsAuth.login()
}
Cypress.Commands.add('home', home)

function arrangeAppointment(crn: string = CRN) {
  cy.visit(`/arrange-appointment/${crn}`)
  hmppsAuth.login()
}
Cypress.Commands.add('arrangeAppointment', arrangeAppointment)

function viewCase({ crn = CRN, path = '' }: { crn?: string; path?: string } = {}) {
  cy.visit(`/case/${crn}${path}`)
  hmppsAuth.login()
}
Cypress.Commands.add('viewCase', viewCase)
