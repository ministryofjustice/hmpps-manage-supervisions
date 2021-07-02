import { DateObject, DateTime } from 'luxon'
import { TIME_FORMAT } from '../validators'

export type RawDate = DateTime | Date | string | DateObject

export function getDateTime(dateOrIso: RawDate, time?: string): DateTime {
  if (!time || !dateOrIso) {
    return null
  }

  const date = safeGetDateTime(dateOrIso)
  return DateTime.fromObject({
    ...DateTime.fromFormat(time, TIME_FORMAT, { locale: 'en-gb' }).toObject(),
    day: date.day,
    month: date.month,
    year: date.year,
    locale: 'en-gb',
  })
}

export function safeGetDateTime(raw: RawDate): DateTime {
  if (!raw) {
    return null
  }
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

export function isActiveDateRange(range: { startDate?: RawDate; endDate?: RawDate }): boolean {
  if (!range.startDate) {
    return false
  }

  const now = DateTime.now()
  const startDate = safeGetDateTime(range.startDate)
  if (startDate > now) {
    return false
  }

  const endDate = safeGetDateTime(range.endDate)
  return !endDate || endDate > now
}
