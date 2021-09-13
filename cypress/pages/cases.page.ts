import { PageBase } from './page'

export class CasesPage extends PageBase {
  get headerUserName() {
    return cy.get('[data-qa=header-user-name]')
  }

  tableHeader() {
    return cy.get(`table[data-qa="cases/case-list"] > thead > tr > th[data-qa="offender-details"]`)
  }

  tableData(row: number) {
    return cy.get(`table[data-qa="cases/case-list"] > tbody > tr:eq(${row}) > td[data-qa="offender-details"]`)
  }

  emptyMessage() {
    return cy.get(`[data-qa="cases/case-list/empty"] > p`)
  }
}
