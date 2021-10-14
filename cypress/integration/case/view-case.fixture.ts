import { CasePage, TABS } from '../../pages/case/case.page'
import { CRN } from '../../plugins/offender'
import { CaseExitPage, ExitPageName } from '../../pages/case/case-exit.page'
import { CaseIneligiblePage } from '../../pages/case/case-ineligible.page'

export class ViewCaseFixture {
  crn = CRN
  page = new CasePage()

  whenViewingOffender(): this {
    cy.viewCase({ crn: this.crn })
    return this
  }

  whenClickingSubNavTab(tab: TABS): this {
    this.page.subNavTab(tab).click()
    return this
  }

  thenWhenReloadingPage() {
    cy.reload()
    return this
  }

  shouldDisplayCommonHeader(): this {
    this.page.pageTitle.contains(`CRN: ${this.crn}`)
    this.page.pageTitle.contains('Liz Danger Haggis (Bob)')
    return this
  }

  shouldRenderOffenderTab<TAB extends TABS>(tab: TAB, assert?: (page: CasePage[TAB]) => void): this {
    this.page.currentTab.should('eq', tab)
    assert && assert(this.page[tab])
    return this
  }

  shouldDisplayExitPage(service: ExitPageName, assert?: (page: CaseExitPage) => void) {
    const page = new CaseExitPage()
    page.pageTitle.contains(CaseExitPage.TITLES[service])
    assert && assert(page)
    return this
  }

  shouldDisplayPageWithTitle(title: string) {
    this.page.pageTitle.contains(title)
    return this
  }

  shouldDisplayIneligibleCasePage(callback: (page: CaseIneligiblePage) => void) {
    const page = new CaseIneligiblePage()
    page.pageTitle.contains('We’re not ready to handle this case')
    callback(page)
    return this
  }

  shouldDisplayIneligibleCaseWarning() {
    this.page.ineligibleCaseWarning.contains('We’re not ready to handle this case')
    return this
  }

  thenWhenGoingBack() {
    cy.go('back')
    return this
  }

  shouldBeAccessible() {
    cy.testA11y()
    return this
  }
}
