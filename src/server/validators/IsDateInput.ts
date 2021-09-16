import { Validate, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime, DateObjectUnits } from 'luxon'

export const IS_DATE_INPUT = 'isDateInput'

export type DateInput = Required<Pick<DateObjectUnits, 'year' | 'month' | 'day'>>

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
