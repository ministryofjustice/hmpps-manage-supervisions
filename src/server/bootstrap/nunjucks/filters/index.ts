import * as name from './name'
import * as dates from './dates'
import * as options from './options'
import * as validation from './validation'
import * as bool from './bool'
import { ToTableRows } from './table'
import * as math from './math'
import * as govukui from './govuk-ui'
import * as arrays from './arrays'
import * as text from './text'
import * as email from './email'
import * as outcome from './outcome'

export const filters = {
  ...name,
  ...dates,
  ...options,
  ...validation,
  ...bool,
  ToTableRows,
  ...math,
  ...govukui,
  ...arrays,
  ...text,
  ...email,
  ...outcome,
}

export * from './types'
