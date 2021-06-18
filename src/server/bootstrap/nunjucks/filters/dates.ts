import { NunjucksFilter } from './types'
import { DateTime } from 'luxon'
import { safeGetDateTime } from '../../../util'

export class ToIsoDate implements NunjucksFilter {
  filter(date: DateTime): string {
    return date.toISODate()
  }
}

export class DateFormat implements NunjucksFilter {
  filter(value: string | DateTime, format: string): string {
    return safeGetDateTime(value).toFormat(format)
  }
}

export class Time implements NunjucksFilter {
  filter(value: string | DateTime): string {
    const datetime = value instanceof DateTime ? value : DateTime.fromISO(value)
    const hourMinuteFormat = datetime.minute === 0 ? 'ha' : 'h:mma'
    return datetime.toFormat(hourMinuteFormat).toLowerCase()
  }
}

export class LongDate implements NunjucksFilter {
  filter(value: string | DateTime): string {
    const date = safeGetDateTime(value)
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }
}

export class Dob implements NunjucksFilter {
  filter(value: string | DateTime): string {
    const date = safeGetDateTime(value)
    const age = DateTime.now().diff(date, 'years')
    return `${date.toFormat('d MMMM yyyy')} (${Math.floor(age.years)} years old)`
  }
}
