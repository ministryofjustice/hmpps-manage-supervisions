import { Validate, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'

export const TIME_FORMAT = 'h:mma'
export const IS_TIME = 'isTime'

export function IsTime(options?: ValidationOptions) {
  return Validate(IsTimeValidator, options)
}

@ValidatorConstraint({ name: IS_TIME, async: false })
export default class IsTimeValidator implements ValidatorConstraintInterface {
  validate(time: string): boolean {
    try {
      return DateTime.fromFormat(time, TIME_FORMAT).isValid
    } catch {
      return false
    }
  }
}
