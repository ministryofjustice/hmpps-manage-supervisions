import {
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DateTime } from 'luxon'
import { getDateTime } from '../util'

export const IS_FUTURE_TIME = 'isFutureTIme'

export function IsFutureTime(dateField: string, options?: ValidationOptions) {
  return Validate(IsFutureTimeValidator, [dateField], options)
}

@ValidatorConstraint({ name: IS_FUTURE_TIME, async: false })
export class IsFutureTimeValidator implements ValidatorConstraintInterface {
  validate(time: string, args: ValidationArguments): boolean {
    try {
      const dateObj = args.object[args.constraints[0]]
      const dateTime = getDateTime(DateTime.fromObject(dateObj), time)

      if (!dateTime.isValid) {
        return true
      }

      return dateTime >= DateTime.now().plus({ minutes: 1 })
    } catch {
      return true
    }
  }
}
