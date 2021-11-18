import { NunjucksFilter } from './types'
import { get, pick } from 'lodash'
import { DateTime } from 'luxon'
import { LongDate, ShortDate, TimeRange } from './dates'
import { safeGetDateTime } from '../../../util'

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
  ShortDate = 'short-date',
  LongDate = 'long-date',
  TimeRange = 'time-range',
}

export type ColumnBase<Path extends string = 'path'> = { type: ColumnType; defaultValue?: any } & {
  [P in Path]: string
} & Omit<TableColumn, 'data' | 'html' | 'format'>

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

export interface ShortDateColumn extends ColumnBase {
  type: ColumnType.ShortDate
}

export interface TimeRangeColumn extends ColumnBase<'from'> {
  type: ColumnType.TimeRange

  /**
   * Path to the end time property.
   */
  to: string
}

export type Column = TextColumn | LinkColumn | ShortDateColumn | LongDateColumn | TimeRangeColumn

export class ToTableRows extends NunjucksFilter {
  private readonly safe = this.environment.getFilter('safe')
  private readonly urlize = this.environment.getFilter('urlize')

  filter(data: any[], columns: Column[]): TableColumn[][] {
    return data.map(x =>
      columns.map(col => ({
        ...pick(col, ['classes', 'colspan', 'rowspan', 'attributes']),
        ...this.getContent(x, col),
      })),
    )
  }

  getContent(row: any, col: Column): Pick<TableColumn, 'text' | 'html' | 'format'> {
    function getDateTime(path: string): DateTime {
      return safeGetDateTime(get(row, path)) || col.defaultValue
    }

    function getAny(path: string) {
      return get(row, path) || col.defaultValue || ''
    }

    switch (col.type) {
      case ColumnType.Text:
        return { text: this.safe(this.urlize(getAny(col.path))) }
      case ColumnType.Link:
        return { html: `<a href="${getAny(col.href)}">${getAny(col.path)}</a>` }
      case ColumnType.ShortDate:
        return { text: ShortDate.apply(getDateTime(col.path)) }
      case ColumnType.LongDate:
        return { text: LongDate.apply(getDateTime(col.path)) }
      case ColumnType.TimeRange: {
        const from = getDateTime(col.from)
        const to = getDateTime(col.to)
        return {
          text: TimeRange.apply(from, to),
        }
      }
    }
  }
}
