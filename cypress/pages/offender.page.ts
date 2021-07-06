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

  get registrations() {
    return cy.get('[data-qa="registration"]')
  }

  get overview() {
    return {
      get mainOffence() {
        return cy.get('[data-qa="offender/overview/main-offence"]')
      },

      get additionalOffences() {
        return cy.get('[data-qa="offender/overview/additional-offence"]')
      },

      get sentence() {
        return cy.get('[data-qa="offender/overview/sentence"]')
      },

      progress(title: string) {
        return cy.get(`dl[data-qa="offender/overview/progress"] dt`).contains(title).siblings('dd')
      },

      get previousOrders() {
        return cy.get('[data-qa="offender/overview/probation-history"] [data-qa="previous-orders"]')
      },

      get nextAppointment() {
        return cy.get('[data-qa="offender/overview/next-appointment"]')
      },

      get appointmentAttendance() {
        return cy.get('[data-qa="offender/overview/appointment-attendance"]')
      },
    }
  }

  get schedule() {
    return {
      get arrangeAppointmentButton() {
        return cy.get('[data-qa="offender/arrange-appointment-button"]')
      },

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

  get activity() {
    return {
      get addToLogButton() {
        return cy.get('[data-qa="offender/add-activity-button"]')
      },

      get emptyMessage() {
        return cy.get('[data-qa="offender/activity/empty"]')
      },

      entry(id: number) {
        return {
          select(selector: string) {
            return cy.get(`[data-qa="offender/activity/${id}"] ${selector}`)
          },

          get title() {
            return this.select('h3')
          },

          get tags() {
            return this.select('[data-qa="tag"]')
          },

          get notes() {
            return this.select('.note-panel')
          },

          get longNotesLink() {
            return this.select('.note-panel [data-qa="view-link"] a')
          },

          get attendanceMissing() {
            return this.select('[data-qa="attendance-missing"]')
          },
        }
      },
    }
  }

  get personal() {
    return {
      tableValue(table: 'contact' | 'personal' | 'equality', title: string) {
        return cy.get(`dl[data-qa="offender/personal-details/${table}"] dt`).contains(title).siblings('dd')
      },

      get viewMainAddressDetails() {
        return cy.get('[data-qa="offender/personal-details/address-details"]')
      },

      mainAddressDetails(title: string) {
        return cy.get('[data-qa="offender/personal-details/address-details"] dl dt').contains(title).siblings('dd')
      },
    }
  }

  get sentence() {
    return {
      mainOffence(title: string) {
        return cy.get(`dl[data-qa="offender/sentence/main-offence"] dt`).contains(title).siblings('dd')
      },

      get noOffences() {
        return cy.get(`[data-qa="offender/sentence/no-offences"]`)
      },

      additionalOffence(id: string, title: string) {
        return cy.get(`dl[data-qa="offender/sentence/additional-offence/${id}"] dt`).contains(title).siblings('dd')
      },

      get noDetails() {
        return cy.get(`[data-qa="offender/sentence/no-details"]`)
      },

      details(title: string) {
        return cy.get(`dl[data-qa="offender/sentence/details"] dt`).contains(title).siblings('dd')
      },

      requirements(title: string) {
        return cy.get(`dl[data-qa="offender/sentence/requirements"] dt`).contains(title).siblings('dd')
      },

      get previous() {
        return cy.get('[data-qa="offender/sentence/probation-history"] [data-qa="previous-orders"]')
      },
    }
  }
}
