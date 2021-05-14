import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DateTime } from 'luxon'
import DateInputForm from '../arrange-appointment/dto/DateInputForm'

@ValidatorConstraint({ name: 'dateInput', async: false })
export default class DateInputValidator implements ValidatorConstraintInterface {
  validate(date: DateInputForm): boolean {
    try {
      return DateTime.fromObject(date as unknown).isValid
    } catch {
      return false
    }
  }
}
