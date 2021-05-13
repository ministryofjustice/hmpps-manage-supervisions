import { NunjucksFilter } from './types'
import { DateTime } from 'luxon'

export class ToIsoDate implements NunjucksFilter {
  filter(date: DateTime): string {
    return date.toISODate()
  }
}

export class DateFormat implements NunjucksFilter {
  filter(value: string | DateTime, format: string): string {
    const date = value instanceof DateTime ? value : DateTime.fromISO(value)
    return date.toFormat(format)
  }
}
