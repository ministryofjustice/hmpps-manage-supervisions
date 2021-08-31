import { OffenderPage, TABS } from '../../../pages/offender.page'
import { CRN } from '../../../plugins/offender'
import { DeliusExitPage } from '../../../pages/delius-exit.page'

export class ViewOffenderFixture {
  crn = CRN
  page = new OffenderPage()

  whenViewingOffender(): this {
    cy.viewOffender({ crn: this.crn })
    return this
  }

  whenClickingSubNavTab(tab: TABS): this {
    this.page.subNavTab(tab).click()
    return this
  }

  shouldDisplayCommonHeader(): this {
    this.page.pageTitle.contains(`CRN: ${this.crn}`)
    this.page.pageTitle.contains('Liz Danger Haggis (Bob)')
    return this
  }

  shouldRenderOffenderTab<TAB extends TABS>(tab: TAB, assert?: (page: OffenderPage[TAB]) => void): this {
    this.page.currentTab.should('eq', tab)
    assert && assert(this.page[tab])
    return this
  }

  shouldDisplayDeliusExitPage(assert?: (page: DeliusExitPage) => void) {
    const page = new DeliusExitPage()
    page.pageTitle.contains('Continue on National Delius')
    assert && assert(page)
    return this
  }

  shouldDisplayPageWithTitle(title: string) {
    this.page.pageTitle.contains(title)
    return this
  }
}
