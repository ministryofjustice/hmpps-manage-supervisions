import { NunjucksFilter } from './types'
import { DateTime } from 'luxon'
import { PotentiallyExpectedDateTime, RawDate, safeGetDateTime } from '../../../util'

export class ToIsoDate extends NunjucksFilter {
  filter(date: DateTime): string {
    return date.toISODate()
  }
}

export class DateFormat extends NunjucksFilter {
  filter(value: RawDate, format: string): string {
    return safeGetDateTime(value).toFormat(format)
  }
}

export class Time extends NunjucksFilter {
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

export class TimeRange extends NunjucksFilter {
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

export class LongDate extends NunjucksFilter {
  filter(value: RawDate): string {
    return LongDate.apply(value)
  }

  static apply(value: RawDate): string {
    const date = safeGetDateTime(value)
    if (!date) {
      return ''
    }
    const format = date.year === DateTime.now().year ? 'cccc d MMMM' : 'cccc d MMMM yyyy'
    return date.toFormat(format)
  }
}

export class ShortDate extends NunjucksFilter {
  filter(value: RawDate): string {
    return ShortDate.apply(value)
  }

  static apply(value: RawDate): string {
    return safeGetDateTime(value)?.toFormat('d MMMM yyyy') || ''
  }
}

export class MonthDate extends NunjucksFilter {
  filter(value: RawDate): string {
    return safeGetDateTime(value).toFormat('MMMM yyyy')
  }
}

export class Dob extends NunjucksFilter {
  filter(value: RawDate): string {
    const date = safeGetDateTime(value)
    const age = DateTime.now().diff(date, 'years')
    return `${date.toFormat('d MMMM yyyy')} (${Math.floor(age.years)} years old)`
  }
}

export class ExpectedDate extends NunjucksFilter {
  filter({ value, expected }: PotentiallyExpectedDateTime): string {
    const date = safeGetDateTime(value).toFormat('d MMMM yyyy')
    return expected ? `${date} (expected)` : date
  }
}

export class LongDateTime extends NunjucksFilter {
  filter(value: RawDate): string {
    if (!value) {
      return ''
    }
    return `${LongDate.apply(value)} at ${Time.apply(value)}`
  }
}
