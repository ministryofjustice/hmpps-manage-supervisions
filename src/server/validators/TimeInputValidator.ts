import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'

export const TIME_FORMAT = 'h:mma'

@ValidatorConstraint({ name: 'timeInput', async: false })
export default class TimeInputValidator implements ValidatorConstraintInterface {
  validate(time: string): boolean {
    try {
      return DateTime.fromFormat(time, TIME_FORMAT).isValid
    } catch {
      return false
    }
  }
}
