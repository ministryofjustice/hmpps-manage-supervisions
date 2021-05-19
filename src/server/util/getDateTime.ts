import { DateTime } from 'luxon'
import { TIME_FORMAT } from '../validators'

export function getDateTime(dateOrIso: DateTime | null | string, time?: string): DateTime {
  if (!time || !dateOrIso) {
    return null
  }

  const date = dateOrIso instanceof DateTime ? dateOrIso : DateTime.fromISO(dateOrIso)

  return DateTime.fromObject({
    ...DateTime.fromFormat(time, TIME_FORMAT, { locale: 'en-gb' }).toObject(),
    day: date.day,
    month: date.month,
    year: date.year,
    locale: 'en-gb',
  })
}
