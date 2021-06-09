import { getDateTime } from './dates'
import { DateTime } from 'luxon'

describe('getDateTime', () => {
  it('ignores missing date', () => {
    const observed = getDateTime(null, '9:00am')
    expect(observed).toBeNull()
  })

  it('ignores missing time', () => {
    const observed = getDateTime(DateTime.now())
    expect(observed).toBeNull()
  })

  it('merges BST date & time', () => {
    const observed = getDateTime(DateTime.fromObject({ day: 19, month: 5, year: 2021, locale: 'en-gb' }), '9:00am')
    expect(observed).toBeInstanceOf(DateTime)
    expect(observed.toISO()).toBe('2021-05-19T09:00:00.000+01:00')
  })

  it('merges UTC date & time', () => {
    const observed = getDateTime(DateTime.fromObject({ day: 1, month: 1, year: 2021, locale: 'en-gb' }), '9:00am')
    expect(observed).toBeInstanceOf(DateTime)
    expect(observed.toISO()).toBe('2021-01-01T09:00:00.000+00:00')
  })
})
