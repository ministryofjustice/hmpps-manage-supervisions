import { PageBase } from './page'
import { Table, TableCallback } from './components/Table'

export class OffenderPreviousOrdersPage extends PageBase {
  previousOrdersTable(callback: TableCallback) {
    Table.selectFromQa('offender/previous-orders', callback)
  }
}
