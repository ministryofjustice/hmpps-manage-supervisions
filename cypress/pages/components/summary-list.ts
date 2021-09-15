import { Card } from './card'
import { Details, DetailsCallback } from './details'

export type SummaryListCallback = (card: SummaryList) => void

/**
 * Selectors for a govuk summary list.
 */
export class SummaryList {
  title(title: string) {
    // we have to be this specific to ignore the nested dts
    return cy.get('> div > dt').contains(title)
  }

  value(title: string) {
    return this.title(title).siblings('dd.govuk-summary-list__value')
  }

  actions(title: string) {
    return this.title(title).siblings('dd.govuk-summary-list__actions')
  }

  detailsList(title: string, name: string, callback: SummaryListCallback, startsClosed = true) {
    this.details(title, name, details => {
      if (startsClosed) {
        details.shouldBeClosed()
        details.toggle()
      }
      cy.get('dl').within(() => callback(new SummaryList()))
    })
  }

  details(title: string, name: string, callback: DetailsCallback) {
    this.value(title).within(() => Details.byName(name, callback))
  }

  /**
   * Select the summary list inside a govuk card by the card title.
   */
  static selectFromCard(title: string, callback: SummaryListCallback) {
    Card.selectByTitle(title, card => card.summaryList(callback))
  }

  static selectFromQa(qaName: string, callback: SummaryListCallback) {
    cy.get(`dl[data-qa="${qaName}"]`).within(() => callback(new SummaryList()))
  }
}
