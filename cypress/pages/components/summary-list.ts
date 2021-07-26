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

  details(title: string, name: string, callback: (list: SummaryList) => void) {
    const details = this.value(title).find('details').contains(name)
    details.click()
    return details
      .parents('details')
      .find('dl')
      .within(() => callback(new SummaryList()))
  }

  /**
   * Select the summary list inside a govuk card by the card title.
   */
  static selectFromCard(title: string, callback: (card: SummaryList) => void) {
    cy.get(`.app-summary-card > header`)
      .contains(title)
      .parents('.app-summary-card')
      .find('.app-summary-card__body > dl')
      .within(() => callback(new SummaryList()))
  }
}
