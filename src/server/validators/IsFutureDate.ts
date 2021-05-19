import { Validate, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'
import { DateInput } from './IsDateInput'

export const IS_FUTURE_DATE = 'isFutureDate'

export function IsFutureDate(options?: ValidationOptions) {
  return Validate(FutureDateValidator, options)
}

@ValidatorConstraint({ name: IS_FUTURE_DATE, async: false })
export default class FutureDateValidator implements ValidatorConstraintInterface {
  validate(date: DateInput): boolean {
    try {
      const parsedDate = DateTime.fromObject(date as unknown)

      if (!parsedDate.isValid) {
        return true
      }

      return parsedDate.startOf('day') >= DateTime.now().startOf('day')
    } catch {
      return true
    }
  }
}
