import { OffenderPage, TABS } from '../../../pages/offender.page'
import { CRN } from '../../../plugins/offender'

export class ViewOffenderFixture {
  crn = CRN
  page = new OffenderPage()

  whenViewingOffender(): this {
    cy.viewOffender(this.crn)
    return this
  }

  whenClickingSubNavTab(tab: TABS): this {
    this.page.subNavTab(tab).click()
    return this
  }

  shouldDisplayCommonHeader(): this {
    this.page.pageTitle.contains(`CRN: ${this.crn}`)
    this.page.pageTitle.contains('Liz Danger Haggis (Bob)')
    this.page.registrations.should('have.length', 2)
    this.page.registrations.contains('High RoSH').parent().should('have.class', 'govuk-tag--red')
    this.page.registrations.contains('Restraining Order').parent().should('have.class', 'govuk-tag--orange')
    return this
  }

  shouldRenderOffenderTab<TAB extends TABS>(tab: TAB, assert: (page: OffenderPage[TAB]) => void): this {
    this.page.currentTab.should('eq', tab)
    assert(this.page[tab])
    return this
  }
}
