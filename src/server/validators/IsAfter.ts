import {
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DateTime } from 'luxon'
import { TIME_FORMAT } from './IsTime'

export const IS_AFTER = 'isAfter'

export function IsAfter(otherField: string, options?: ValidationOptions) {
  return Validate(IsAfterValidator, [otherField], options)
}

@ValidatorConstraint({ name: IS_AFTER, async: false })
export class IsAfterValidator implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    if (!parseTime(propertyValue).isValid || !parseTime(args.object[args.constraints[0]]).isValid) {
      return true
    }

    return parseTime(propertyValue) > parseTime(args.object[args.constraints[0]])
  }
}

function parseTime(time: string) {
  return DateTime.fromFormat(time, TIME_FORMAT)
}
