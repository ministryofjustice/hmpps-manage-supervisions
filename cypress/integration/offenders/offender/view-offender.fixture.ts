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

  shouldDisplayCommonHeader({ registrations = true }: { registrations?: boolean } = {}): this {
    this.page.pageTitle.contains(`CRN: ${this.crn}`)
    this.page.pageTitle.contains('Liz Danger Haggis (Bob)')

    if (registrations) {
      this.page.registrations.should('have.length', 1)
      this.page.registrations.contains('Restraining Order').parent().should('have.class', 'govuk-tag--orange')
    } else {
      this.page.registrations.should('not.exist')
    }

    return this
  }

  shouldRenderOffenderTab<TAB extends TABS>(tab: TAB, assert: (page: OffenderPage[TAB]) => void): this {
    this.page.currentTab.should('eq', tab)
    assert(this.page[tab])
    return this
  }
}
