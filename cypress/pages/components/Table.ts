export type TableCallback = (table: Table) => void

export class Table {
  cell(row: number, column: number) {
    return cy.get(`tbody > tr:eq(${row}) > td:eq(${column})`)
  }

  static selectFromQa(qaName: string, callback: TableCallback) {
    cy.get(`table[data-qa="${qaName}"]`).within(() => callback(new Table()))
  }
}
