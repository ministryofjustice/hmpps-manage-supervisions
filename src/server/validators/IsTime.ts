import { Validate, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'

export const TIME_FORMAT = 'h:mma'
const TIME_FORMATS = [
  'h:mma', // '4:00pm'
  'ha', // '4pm'
  'h', // '16'
  'h.mma', // '4.00pm'
]
// Iterates through all the allowed time formats and returns the first valid DateTime
// based on the time passed in.
export function parseTime(time: string): DateTime {
  time = time.replace(/\s+/g, '')
  for (const tf of TIME_FORMATS) {
    const dt = DateTime.fromFormat(time, tf)
    if (dt.isValid) return dt
  }
  return null
}
export const IS_TIME = 'isTime'

export function IsTime(options?: ValidationOptions) {
  return Validate(IsTimeValidator, options)
}

@ValidatorConstraint({ name: IS_TIME, async: false })
export default class IsTimeValidator implements ValidatorConstraintInterface {
  validate(time: string): boolean {
    try {
      return !!parseTime(time)
    } catch {
      return false
    }
  }
}
