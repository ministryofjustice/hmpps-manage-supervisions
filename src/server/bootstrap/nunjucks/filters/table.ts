import { NunjucksFilter } from './types'
import { get, pick } from 'lodash'
import { DateTime } from 'luxon'
import { LongDate, TimeRange } from './dates'

export interface TableColumn {
  /**
   * If `html` is set, this is not required. Text for cells in table rows. If `html` is provided, the `text` argument will be ignored.
   */
  text?: string

  /**
   * If `text` is set, this is not required. HTML for cells in table rows. If `html` is provided, the `text` argument will be ignored.
   */
  html?: string

  /**
   * Specify format of a cell. Currently we only use "numeric".
   */
  format?: 'numeric'

  /**
   * Classes to add to the table row cell.
   */
  classes?: string

  /**
   * Specify how many columns a cell extends.
   */
  colspan?: number

  /**
   * Specify how many rows a cell extends.
   */
  rowspan?: number

  /**
   * HTML attributes (for example data attributes) to add to the table cell.
   */
  attributes?: Record<string, string>
}

export enum ColumnType {
  Text = 'text',
  Link = 'link',
  LongDate = 'long-date',
  TimeRange = 'time-range',
}

export type ColumnBase<Path extends string = 'path'> = { type: ColumnType } & { [P in Path]: string } &
  Omit<TableColumn, 'data' | 'html' | 'format'>

export interface TextColumn extends ColumnBase {
  type: ColumnType.Text
}

export interface LinkColumn extends ColumnBase {
  type: ColumnType.Link

  /**
   * Path to the href property.
   */
  href: string
}

export interface LongDateColumn extends ColumnBase {
  type: ColumnType.LongDate
}

export interface TimeRangeColumn extends ColumnBase<'from'> {
  type: ColumnType.TimeRange

  /**
   * Path to the end time property.
   */
  to: string
}

export type Column = TextColumn | LinkColumn | LongDateColumn | TimeRangeColumn

export class ToTableRows implements NunjucksFilter {
  filter(data: any[], columns: Column[]): TableColumn[][] {
    return data.map(x =>
      columns.map(col => ({
        ...pick(col, ['classes', 'colspan', 'rowspan', 'attributes']),
        ...ToTableRows.getContent(x, col),
      })),
    )
  }

  private static getContent(row: any, col: Column): Pick<TableColumn, 'text' | 'html' | 'format'> {
    switch (col.type) {
      case ColumnType.Text:
        return { text: get(row, col.path) }
      case ColumnType.Link:
        return { html: `<a href="${get(row, col.href)}">${get(row, col.path)}</a>` }
      case ColumnType.LongDate:
        return { text: LongDate.apply(this.getDateTime(row, col.path)) }
      case ColumnType.TimeRange: {
        const from = this.getDateTime(row, col.from)
        const to = this.getDateTime(row, col.to)
        return {
          text: TimeRange.apply(from, to),
        }
      }
    }
  }

  private static getDateTime(row: any, path: string): DateTime {
    const raw = get(row, path)
    if (raw instanceof DateTime) {
      return raw
    }
    if (raw instanceof Date) {
      return DateTime.fromJSDate(raw)
    }
    switch (typeof raw) {
      case 'string':
        return DateTime.fromISO(raw)
      case 'object':
        return DateTime.fromObject(raw)
      default:
        throw new Error(`Unknown date type '${raw}'`)
    }
  }
}
