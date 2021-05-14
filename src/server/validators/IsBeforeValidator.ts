import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'
import { TIME_FORMAT } from './TimeInputValidator'

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsBeforeValidator implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    if (!parseTime(propertyValue).isValid || !parseTime(args.object[args.constraints[0]]).isValid) {
      return true
    }

    return parseTime(propertyValue) < parseTime(args.object[args.constraints[0]])
  }
}

function parseTime(time: string) {
  return DateTime.fromFormat(time, TIME_FORMAT)
}
