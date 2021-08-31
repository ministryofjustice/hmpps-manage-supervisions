import { Card } from './card'

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
    return this.title(title).siblings('dd')
  }

  detailsList(title: string, name: string, callback: SummaryListCallback) {
    const details = this.value(title).find('details').contains(name)
    details.click()
    return details
      .parents('details')
      .find('dl')
      .within(() => callback(new SummaryList()))
  }

  details(title: string, name: string, callback: () => void) {
    const details = this.value(title).find('details').contains(name)
    details.click()
    return details.parents('details').within(() => callback())
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
