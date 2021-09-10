import { CasesPage } from '../pages'

export class ViewCasesFixture {
  page = new CasesPage()

  shouldRenderCasesHeader(message: string): this {
    this.page.tableHeader().contains(message).click()
    return this
  }

  shouldRenderCasesRow(row: number, name: string, crn: string): this {
    this.page
      .tableData(row)
      .get('a[data-qa="offender-link"]')
      .contains(name)
      .should('have.attr', 'href')
      .and('include', `offender/${crn}/overview`)
    this.page.tableData(row).get('span[data-qa="offender-crn"]').contains(crn)
    return this
  }

  linkShouldNavigateToOffenderOverview

  shouldDisplayEmptyWarning(message: string): this {
    this.page.emptyMessage().contains(message)
    return this
  }
}
