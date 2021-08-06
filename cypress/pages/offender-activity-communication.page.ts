import { PageBase } from './page'

export class OffenderActivityCommunicationPage extends PageBase {
  detail(title: string) {
    return cy.get('dl[data-qa="offender/activity/communication"] dt').contains(title).siblings('dd')
  }
  getLastUpdated() {
    return cy.get('[data-qa="contact-last-updated"]')
  }
}