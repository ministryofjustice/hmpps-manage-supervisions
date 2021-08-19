import { PageBase } from './page'
import { SummaryList } from './components/summary-list'
import { Table, TableCallback } from './components/Table'

export type TABS = 'overview' | 'schedule' | 'activity' | 'personal' | 'sentence' | 'compliance' | 'risk'
export type SCHEDULE_TABLE = 'future' | 'recent'
export type SCHEDULE_COL = 'date' | 'time' | 'appointment'

export class OffenderPage extends PageBase {
  subNavTab(name: TABS) {
    return cy.get(`nav[data-qa="offender/sub-nav"] li a[data-qa="${name}"]`)
  }

  get currentTab() {
    return cy.url().then(url => url.match(/\/offender\/[A-Za-z0-9]+\/(\w+)\/?/)[1])
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

      get roshRisksSection() {
        return cy.get('[data-qa="offender/overview/rosh-risks-section"]')
      },
    }
  }

  get schedule() {
    return {
      get arrangeAppointmentButton() {
        return cy.get('[data-qa="offender/arrange-appointment-button"]')
      },

      tableCaption(table: SCHEDULE_TABLE) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > caption`)
      },

      tableHeader(table: SCHEDULE_TABLE, column: SCHEDULE_COL) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > thead > tr > th[data-qa="${column}"]`)
      },

      tableData(table: SCHEDULE_TABLE, row: number, column: SCHEDULE_COL) {
        return cy.get(`table[data-qa="offender/schedule/${table}"] > tbody > tr:eq(${row}) > td[data-qa="${column}"]`)
      },

      emptyHeader(table: SCHEDULE_TABLE) {
        return cy.get(`[data-qa="offender/schedule/empty-${table}"] > h2`)
      },

      emptyMessage(table: SCHEDULE_TABLE) {
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

      filterLink(filterType: string) {
        return cy.get(`[data-qa="offender/activity-filter-${filterType}"]`)
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
      get noDetails() {
        return cy.get(`[data-qa="offender/sentence/no-sentence"]`)
      },

      offence(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Offence', callback)
      },

      conviction(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Conviction', callback)
      },

      sentence(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Sentence', callback)
      },

      probationHistory(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Probation history', callback)
      },
    }
  }

  get compliance() {
    return {
      get startBreachButton() {
        return cy.get('[data-qa="offender/compliance/start-breach"]')
      },

      get noCurrentConvictionWarning() {
        return cy.get('[data-qa="offender/compliance/no-current-conviction"]')
      },

      get noPreviousConvictionsWarning() {
        return cy.get('[data-qa="offender/compliance/no-previous-convictions"]')
      },

      get previousOrdersTitle() {
        return cy.get('[data-qa="offender/compliance/previous-orders-title"]')
      },

      get currentStatus() {
        return cy.get('[data-qa="offender/compliance/current-status"]')
      },

      sentence(callback: (card: SummaryList) => void) {
        return SummaryList.selectFromCard('Sentence', callback)
      },

      breachDetails(callback: (card: SummaryList) => void) {
        return SummaryList.selectFromCard('Breach details', callback)
      },

      requirement(callback: (card: SummaryList) => void) {
        return SummaryList.selectFromCard('Requirement', callback)
      },

      get requirementName() {
        return cy.get('[data-qa="offender/compliance/requirement-name"]')
      },

      get sinceLastBreachMessage() {
        return cy.get('[data-qa="offender/compliance/compliance-since-last-breach"]')
      },
    }
  }

  get risk() {
    return {
      get noRisksWarning() {
        return cy.get('[data-qa="offender/risk/no-risk-assessment"]')
      },

      roshCommunity(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Risk of serious harm (ROSH) in the community', callback)
      },

      roshThemselves(callback: (card: SummaryList) => void) {
        SummaryList.selectFromCard('Risk of serious harm to themselves', callback)
      },

      get currentNotes() {
        return cy.get('[data-qa="offender/risk/current-notes"]')
      },

      get previousNotes() {
        return cy.get('[data-qa="offender/risk/previous-notes"]')
      },

      riskFlags(callback: TableCallback) {
        Table.selectFromQa('offender/risk/registrations', callback)
      },

      get viewInactiveRegistrations() {
        return cy.get('[data-qa="offender/risk/view-inactive-registrations"]')
      },

      get noActiveRegistrations() {
        return cy.get('[data-qa="offender/risk/no-active-registrations"]')
      },
    }
  }
}
