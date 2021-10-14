import { PageBase } from '../page'
import { SummaryList, SummaryListCallback } from '../components/summary-list'
import { Table, TableCallback } from '../components/table'
import { Card, CardCallback } from '../components/card'
import { DateTime } from 'luxon'
import { kebabCase } from 'lodash'
import { Details, DetailsCallback } from '../components/details'

export type TABS = 'overview' | 'schedule' | 'activity' | 'personal' | 'sentence' | 'compliance' | 'risk'
export type SCHEDULE_TABLE = 'future' | 'recent'
export type SCHEDULE_COL = 'date' | 'time' | 'appointment'

class ActivityLogGroupEntry extends Card {
  get subTitle() {
    return this.title.find('[data-qa="sub-title"]')
  }

  get notes() {
    return this.body.find('[data-qa=notes]')
  }

  notesDetail(sensitive: boolean, callback: DetailsCallback) {
    Details.byName(sensitive ? 'Notes (sensitive)' : 'Notes', callback)
  }
}

class ActivityLogGroup {
  get title() {
    return cy.get('[data-qa="offender/activity/group-title"]')
  }

  entry(id: number, callback: (entry: ActivityLogGroupEntry) => void) {
    Card.selectByQa(`offender/activity/${id}`, () => callback(new ActivityLogGroupEntry()))
  }
}

export class CasePage extends PageBase {
  subNavTab(name: TABS) {
    return cy.get(`nav[data-qa="offender/sub-nav"] li a[data-qa="${name}"]`)
  }

  get currentTab() {
    return cy.url().then(url => url.match(/\/case\/[A-Za-z0-9]+\/(\w+)\/?/)[1])
  }

  get ineligibleCaseWarning() {
    return cy.get('[data-qa="offender/ineligible-case-warning"]')
  }

  get overview() {
    return {
      schedule(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Schedule', callback)
      },

      personalDetails(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Personal details', callback)
      },

      risk(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Risk', callback)
      },

      sentence(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Sentence', callback)
      },

      activityAndCompliance(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Activity and compliance', callback)
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
        return cy.get(`table[data-qa="offender/schedule/${table}"] > tbody > tr:eq(${row}) > [data-qa="${column}"]`)
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

      group(date: string, callback: (group: ActivityLogGroup) => void) {
        cy.get(`[data-qa="offender/activity/${kebabCase(date)}"]`).within(() => {
          const group = new ActivityLogGroup()
          callback(group)
        })
      },

      clickEntryLink(id: number) {
        new ActivityLogGroup().entry(id, entry => entry.title.find('a').click())
      },

      entry(id: number) {
        return cy.get(`[data-qa="offender/activity/${id}"]`)
      },

      systemContactTitle(id: number, title: string) {
        return cy.get(`[data-qa="offender/activity/${id}"]`).contains(title)
      },
    }
  }

  get personal() {
    return {
      contactDetails(callback: SummaryListCallback) {
        return SummaryList.selectFromCard('Contact details', callback)
      },

      personalDetails(callback: SummaryListCallback) {
        return SummaryList.selectFromCard('Personal details', callback)
      },

      equalityMonitoring(callback: SummaryListCallback) {
        return SummaryList.selectFromCard('Equality monitoring', callback)
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
      get startBreachLink() {
        return cy.get('a[data-qa="offender/compliance/start-breach"]')
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

      sentence(callback: CardCallback) {
        Card.selectByTitle('Sentence', callback)
      },

      breachDetails(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Breach details', callback)
      },

      requirement(callback: SummaryListCallback) {
        SummaryList.selectFromCard('Requirement', callback)
      },

      previousOrder(name: string, endDate: DateTime, callback: CardCallback) {
        Card.selectByTitle(`24 month CJA Community Order (Ended ${endDate.toFormat('d MMMM yyyy')})`, callback)
      },

      get requirementName() {
        return cy.get('[data-qa="offender/compliance/requirement-name"]')
      },

      get sinceLastBreachMessage() {
        return cy.get('[data-qa="offender/compliance/compliance-since-last-breach"]')
      },

      get multipleBreachWarning() {
        return cy.get('[data-qa="offender/compliance/multiple-breaches"]')
      },

      get viewAllOrdersLink() {
        return cy.get('a[data-qa="offender/compliance/view-all-orders"]')
      },
    }
  }

  get risk() {
    return {
      get noRisksWarning() {
        return cy.get('[data-qa="offender/risk/no-risk-assessment"]')
      },

      roshCommunity(callback: CardCallback) {
        Card.selectByTitle('Risk of serious harm (ROSH) in the community', callback)
      },

      roshThemselves(callback: CardCallback) {
        Card.selectByTitle('Risk of serious harm to themselves', callback)
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

      whenClickingRiskRegistration(registrationName: string) {
        return cy.get('[data-qa="offender/risk/registrations"]').children().contains(registrationName).click()
      },
    }
  }
}
