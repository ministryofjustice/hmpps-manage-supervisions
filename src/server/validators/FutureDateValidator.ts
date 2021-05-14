import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'
import DateInputForm from '../arrange-appointment/dto/DateInputForm'

@ValidatorConstraint({ name: 'futureDate', async: false })
export default class FutureDateValidator implements ValidatorConstraintInterface {
  validate(date: DateInputForm): boolean {
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
