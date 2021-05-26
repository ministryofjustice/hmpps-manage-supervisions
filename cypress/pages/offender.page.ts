import { PageBase } from './page'

export type TABS = 'overview' | 'schedule' | 'activity' | 'personal' | 'sentence'
export type TABLE = 'future' | 'recent'
export type COL = 'date' | 'time' | 'appointment'

export class OffenderPage extends PageBase {
  subNavTab(name: TABS) {
    return cy.get(`nav[data-qa="offender/sub-nav"] li a[data-qa="${name}"]`)
  }

  get currentTab() {
    return cy.url().then(url => url.match(/\/offender\/.+\/(.+)/)[1])
  }

  get arrangeAppointmentButton() {
    return cy.get('[data-qa="offender/arrange-appointment-button"]')
  }

  get schedule() {
    return {
      tableCaption(table: TABLE) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > caption`)
      },

      tableHeader(table: TABLE, column: COL) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > thead > tr > th[data-qa="${column}"]`)
      },

      tableData(table: TABLE, row: number, column: COL) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > tbody > tr:eq(${row}) > td[data-qa="${column}"]`)
      },

      emptyHeader(table: TABLE) {
        return cy.get(`[data-qa="offender/schedule/empty-${table}"] > h2`)
      },

      emptyMessage(table: TABLE) {
        return cy.get(`[data-qa="offender/schedule/empty-${table}"] > p`)
      },
    }
  }
}
