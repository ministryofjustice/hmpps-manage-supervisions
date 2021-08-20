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
    cy.get(`.app-summary-card > header`)
      .contains(title)
      .parents('.app-summary-card')
      .find('.app-summary-card__body > dl')
      .within(() => callback(new SummaryList()))
  }
}
