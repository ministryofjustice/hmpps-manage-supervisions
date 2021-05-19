import { Validate, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'

export const IS_DATE_INPUT = 'isDateInput'

export interface DateInput {
  day: number
  month: number
  year: number
}

export function IsDateInput(options?: ValidationOptions) {
  return Validate(DateInputValidator, options)
}

@ValidatorConstraint({ name: IS_DATE_INPUT, async: false })
export default class DateInputValidator implements ValidatorConstraintInterface {
  validate(date: DateInput): boolean {
    try {
      return DateTime.fromObject(date).isValid
    } catch {
      return false
    }
  }
}
