import { PageBase } from '../page'

export type ADDRESS = 'main' | 'other' | 'previous'

export class CaseAddressesPage extends PageBase {
  addressTitle(table: ADDRESS) {
    return cy.get(`[data-qa="offender/addresses/${table}"] h2`)
  }

  addressCell(table: ADDRESS, title: string) {
    return cy.get(`[data-qa="offender/addresses/${table}"] dl dt`).contains(title)
  }

  address(table: ADDRESS, title: string) {
    return this.addressCell(table, title).siblings('dd')
  }
}
