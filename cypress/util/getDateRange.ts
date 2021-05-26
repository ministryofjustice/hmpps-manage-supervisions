import { DateObjectUnits, DateTime, DurationInput } from 'luxon'
import * as faker from 'faker'

export function getDateRange(
  type: 'future' | 'soon' | 'recent' | 'past',
  set: DateObjectUnits = {},
  duration: DurationInput = { hour: 2 },
): { start: string; end: string } {
  const start = DateTime.fromJSDate(faker.date[type]()).set({
    hour: faker.datatype.number({ min: 9, max: 17 }),
    second: 0,
    millisecond: 0,
    ...set,
  })
  return { start: start.toISO(), end: start.plus(duration).toISO() }
}
