import { NunjucksFilter } from './types'
import { DateTime } from 'luxon'
import { PotentiallyExpectedDateTime, RawDate, safeGetDateTime } from '../../../util'

export class ToIsoDate implements NunjucksFilter {
  filter(date: DateTime): string {
    return date.toISODate()
  }
}

export class DateFormat implements NunjucksFilter {
  filter(value: RawDate, format: string): string {
    return safeGetDateTime(value).toFormat(format)
  }
}

export class Time implements NunjucksFilter {
  filter(value: RawDate): string {
    return Time.apply(value)
  }

  static apply(value: RawDate): string {
    const datetime = safeGetDateTime(value)
    if (!datetime) {
      throw new Error(`cannot parse time from ${value}`)
    }
    const hourMinuteFormat = datetime.minute === 0 ? 'ha' : 'h:mma'
    return datetime.toFormat(hourMinuteFormat).toLowerCase()
  }
}

export class TimeRange implements NunjucksFilter {
  filter(from: RawDate, to?: RawDate): string {
    return TimeRange.apply(from, to)
  }

  static apply(from: RawDate, to?: RawDate): string {
    return [Time.apply(from), to && Time.apply(to)]
      .filter(x => x)
      .join(' to ')
      .toLowerCase()
  }
}

export class LongDate implements NunjucksFilter {
  filter(value: RawDate): string {
    return LongDate.apply(value)
  }

  static apply(value: RawDate): string {
    const date = safeGetDateTime(value)
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }
}

export class ShortDate implements NunjucksFilter {
  filter(value: RawDate): string {
    return safeGetDateTime(value).toFormat('d MMMM yyyy')
  }
}

export class Dob implements NunjucksFilter {
  filter(value: RawDate): string {
    const date = safeGetDateTime(value)
    const age = DateTime.now().diff(date, 'years')
    return `${date.toFormat('d MMMM yyyy')} (${Math.floor(age.years)} years old)`
  }
}

export class ExpectedDate implements NunjucksFilter {
  filter({ value, expected }: PotentiallyExpectedDateTime): string {
    const date = safeGetDateTime(value).toFormat('d MMMM yyyy')
    return expected ? `${date} (expected)` : date
  }
}
