import { OffenderPage, TABS } from '../../../pages/offender.page'
import { CRN } from '../../../plugins/offender'
import { ExitPage, ExitPageName } from '../../../pages/exit.page'

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

  shouldDisplayExitPage(service: ExitPageName, assert?: (page: ExitPage) => void) {
    const page = new ExitPage()
    page.pageTitle.contains(ExitPage.TITLES[service])
    assert && assert(page)
    return this
  }

  shouldDisplayPageWithTitle(title: string) {
    this.page.pageTitle.contains(title)
    return this
  }

  thenWhenGoingBack() {
    cy.go('back')
    return this
  }
}
