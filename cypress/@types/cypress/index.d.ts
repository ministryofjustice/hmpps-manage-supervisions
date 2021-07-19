/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    home(): Chainable<Element>
    arrangeAppointment(crn: string): Chainable<Element>
    viewOffender(crn: string): Chainable<Element>
  }
}
