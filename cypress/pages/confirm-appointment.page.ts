import { PageBase } from './page'

export class ConfirmAppointmentPage extends PageBase {
  get timeMessage() {
    return cy.get('span[data-qa="confirm-appointment/times"]')
  }

  get descriptionMessage() {
    return cy.get('span[data-qa="confirm-appointment/description"]')
  }

  get phoneMessage() {
    return cy.get('span[data-qa="confirm-appointment/phone"]')
  }

  get finishButton() {
    return cy.get('button[data-qa="confirm-appointment/finish-button"]')
  }
}
