import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'
import { getDateTime } from '../arrange-appointment/dto/AppointmentWizardUpdateWhen.dto'

@ValidatorConstraint({ name: 'futureTime', async: false })
export default class FutureTimeValidator implements ValidatorConstraintInterface {
  validate(time: string, args: ValidationArguments): boolean {
    try {
      const dateTime = getDateTime(args.object[args.constraints[0]], time)

      if (!dateTime.isValid) {
        return true
      }

      return dateTime >= DateTime.now().plus({ minutes: 1 })
    } catch {
      return true
    }
  }
}
