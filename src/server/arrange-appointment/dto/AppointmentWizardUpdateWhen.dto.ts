import { Expose, Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'

import { DateTime } from 'luxon'
import FutureDateValidator from '../../validators/FutureDateValidator'
import FutureTimeValidator from '../../validators/FutureTimeValidator'
import DateInputValidator from '../../validators/DateInputValidator'
import { IsBeforeValidator } from '../../validators/IsBeforeValidator'
import TimeInputValidator, { TIME_FORMAT } from '../../validators/TimeInputValidator'
import DateInputForm from './DateInputForm'

export class AppointmentWizardUpdateWhenDto {
  @Type(() => DateInputForm)
  @Validate(DateInputValidator, { message: 'Enter a valid date' })
  @Validate(FutureDateValidator, { message: 'Enter a date in the future' })
  @ValidateNested()
  @Expose()
  startDate: DateInputForm

  @Expose()
  @Validate(TimeInputValidator, { message: 'Enter a valid start time' })
  @Validate(IsBeforeValidator, ['endTime'], { message: 'Enter a start time before the end time' })
  @Validate(FutureTimeValidator, ['startDate'], { message: 'Enter a start time in the future' })
  startTime: string

  @Expose()
  @Validate(TimeInputValidator, { message: 'Enter a valid end time' })
  endTime: string

  setFromDates(start: DateTime, end: DateTime) {
    if (start) {
      this.startDate = {
        day: start.day.toString(),
        month: start.month.toString(),
        year: start.year.toString(),
      }
      this.startTime = start.toFormat(TIME_FORMAT)
    }

    if (end) {
      this.endTime = end.toFormat(TIME_FORMAT)
    }
  }

  getStartDateTime() {
    return getDateTime(this.startDate, this.startTime)
  }

  getEndDateTime() {
    return getDateTime(this.startDate, this.endTime)
  }
}

export function getDateTime(date: DateInputForm, time: string) {
  if (!date || !time) {
    return
  }

  return DateTime.fromFormat(`${date.year}-${date.month}-${date.day} ${time}`, 'y-M-d h:mma', { locale: 'en-gb' })
}
