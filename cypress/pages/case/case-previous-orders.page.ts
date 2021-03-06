import { PageBase } from '../page'
import { Table, TableCallback } from '../components/table'

export class CasePreviousOrdersPage extends PageBase {
  previousOrdersTable(callback: TableCallback) {
    Table.selectFromQa('offender/previous-orders', callback)
  }
}
