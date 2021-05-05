/// <reference types="cypress" />

declare namespace Cypress {
  type ArrangeAppointmentStep = 'check'

  interface Chainable {
    login(): Chainable<Element>
    home(): Chainable<Element>
    arrangeAppointmentStep(crn: string, step: ArrangeAppointmentStep): Chainable<Element>
  }
}
