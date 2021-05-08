/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): Chainable<Element>
    home(): Chainable<Element>
    arrangeAppointment(crn: string): Chainable<Element>
  }
}
