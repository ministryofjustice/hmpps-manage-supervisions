import {
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { parseTime } from './IsTime'

export const IS_AFTER = 'isAfter'

export function IsAfter(otherField: string, options?: ValidationOptions) {
  return Validate(IsAfterValidator, [otherField], options)
}

@ValidatorConstraint({ name: IS_AFTER, async: false })
export class IsAfterValidator implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const startTime = parseTime(args.object[args.constraints[0]])
    const endTime = parseTime(propertyValue)

    if (!endTime || !startTime) {
      return true
    }

    return endTime > startTime
  }
}
