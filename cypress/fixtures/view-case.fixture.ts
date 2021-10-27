import { CasePage, TABS } from '../pages/case/case.page'
import { CRN } from '../plugins/offender'
import { CaseExitPage, ExitPageName } from '../pages/case/case-exit.page'
import { CaseIneligiblePage } from '../pages/case/case-ineligible.page'
import { CasePreviousOrdersPage } from '../pages/case/case-previous-orders.page'

interface CaseFixtureData {
  crn: string
  displayName: string
}

const LIZ_LOCAL: CaseFixtureData = {
  crn: CRN,
  displayName: 'Liz Danger Haggis (Bob)',
}

export class ViewCaseFixture {
  page = new CasePage()

  constructor(readonly data = LIZ_LOCAL) {}

  whenViewingOffender(): this {
    cy.viewCase({ crn: this.data.crn })
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

  dismissEligibilityWarningIfPresent() {
    const page = new CaseIneligiblePage()
    page.pageTitle.then(title => {
      if (title.text().includes('We’re not ready to handle this case')) {
        page.continueButton.click()
      }
    })
    return this
  }

  shouldDisplayCommonHeader(): this {
    this.page.pageTitle.contains(`CRN: ${this.data.crn}`)
    this.page.pageTitle.contains(this.data.displayName)
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

  shouldDisplayOASysDataUnavailableWarning() {
    this.page.oasysDataUnavailableWarning.contains(
      'Some of the data on this page is incomplete as we cannot currently retrieve risk assessments from OASys',
    )
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
  shouldRenderPreviousOrdersPage(callback: (page: CasePreviousOrdersPage) => void) {
    const page = new CasePreviousOrdersPage()
    page.pageTitle.contains('Previous orders')
    callback(page)
    return this
  }
}
