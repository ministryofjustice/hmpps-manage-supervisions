import { DateInput, DateTime, DurationUnit } from 'luxon'
import { parseTime } from '../validators'
import { quantity } from './math'

export interface PotentiallyExpectedDateTime {
  value: DateTime
  expected: boolean
}

export function getPotentiallyExpectedDateTime(date: string, expectedDate: string): PotentiallyExpectedDateTime | null {
  return date
    ? { value: DateTime.fromISO(date), expected: false }
    : expectedDate
    ? { value: DateTime.fromISO(expectedDate), expected: true }
    : null
}

export type RawDate = string | DateInput

export function getDateTime(dateOrIso: RawDate, time?: string): DateTime {
  if (!time || !dateOrIso) {
    return null
  }

  const date = safeGetDateTime(dateOrIso)
  return DateTime.fromObject({
    ...parseTime(time).toObject(),
    day: date.day,
    month: date.month,
    year: date.year,
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

export function getElapsed(date: RawDate, length: number, units: string): { elapsed: string; length: string } | null {
  if (!units || !length) {
    return null
  }

  // luxon requires that duration units are plural for some reason...
  const cleanUnits = units.trim().toLowerCase()
  const durationUnit = (cleanUnits.endsWith('s') ? cleanUnits : cleanUnits + 's') as DurationUnit

  try {
    const start = safeGetDateTime(date)
    const diffToNow = DateTime.now().diff(start, durationUnit).as(durationUnit)
    if (diffToNow < 0) {
      // must start in the future
      return null
    }

    const elapsed = Math.min(Math.floor(diffToNow), length)
    return {
      elapsed: quantity(elapsed, durationUnit),
      length: quantity(length, durationUnit),
    }
  } catch (err) {
    // probably bad units
    this.logger.error(`Cannot determine duration ${JSON.stringify({ date, length, units })}: ${err.message}`)
    return null
  }
}
