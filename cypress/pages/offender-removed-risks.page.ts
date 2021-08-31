import { Table, TableCallback } from './components/table'
import { PageBase } from './page'

export class OffenderRemovedRisksPage extends PageBase {
  removedRisksTable(callback: TableCallback) {
    Table.selectFromQa('offender-risk/removed-registrations', callback)
  }

  whenClickingRiskRegistration(registrationName: string) {
    return cy.get('[data-qa="offender-risk/removed-registrations"]').children().contains(registrationName).click()
  }
}
