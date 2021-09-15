import { SummaryList, SummaryListCallback } from './summary-list'

export type CardCallback = (card: Card) => void

export class Card {
  get title() {
    return cy.get('.app-summary-card__title')
  }

  get body() {
    return cy.get('.app-summary-card__body')
  }

  get actions() {
    return cy.get('.app-summary-card__actions')
  }

  get actionLinks() {
    return this.actions.find('a')
  }

  summaryList(callback: SummaryListCallback) {
    return this.body.find('> dl').within(() => callback(new SummaryList()))
  }

  static selectByTitle(title: string, callback: CardCallback) {
    cy.get(`.app-summary-card > header`)
      .contains(title)
      .parents('.app-summary-card')
      .within(() => callback(new Card()))
  }

  static selectByQa(qaName: string, callback: CardCallback) {
    cy.get(`.app-summary-card[data-qa="${qaName}"]`).within(() => callback(new Card()))
  }
}
