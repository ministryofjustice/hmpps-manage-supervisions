import { Type } from 'class-transformer'
import { DateTime } from 'luxon'
import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, ValidateIf, ValidateNested } from 'class-validator'
import { AppointmentWizardStep } from './AppointmentWizardViewModel'
import { RequiredOptional } from './AppointmentTypeDto'
import { DateInput, IsAfter, IsDateInput, IsFutureTime, ValidationGroup, IsFutureDate, IsTime } from '../../validators'
import { getDateTime } from '../../util'
import { ExposeDefault, ToBoolean } from '../../util/mapping'

export const MESSAGES = {
  type: {
    required: 'Select an appointment type',
  },
  location: {
    required: 'Select a location',
  },
  date: {
    required: 'Enter a {}',
  },
  sensitive: {
    required: 'Select yes if the appointment contains sensitive information',
  },
}

function IsAppointmentType() {
  return ValidationGroup(
    { message: MESSAGES.type.required, groups: [AppointmentWizardStep.Type] },
    IsString,
    IsNotEmpty,
  )
}

function IsLocationCode() {
  return ValidationGroup(
    { message: MESSAGES.location.required, groups: [AppointmentWizardStep.Where] },
    IsString,
    IsNotEmpty,
  )
}

function IsDateComponent(component: 'day' | 'month' | 'year') {
  return ValidationGroup(
    { message: MESSAGES.date.required.replace('{}', component), groups: [AppointmentWizardStep.When] },
    IsInt,
    IsPositive,
  )
}

export class AppointmentDateDto implements DateInput {
  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsDateComponent('day')
  @Type(() => Number)
  day: number

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsDateComponent('month')
  @Type(() => Number)
  month: number

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsDateComponent('year')
  @Type(() => Number)
  year: number

  get value(): DateTime | null {
    if (!this.day || !this.month || !this.year) {
      return null
    }

    return DateTime.fromObject({ day: this.day, month: this.month, year: this.year, locale: 'en-gb' })
  }

  set value(value: DateTime | null) {
    if (value) {
      this.day = value.day
      this.month = value.month
      this.year = value.year
    } else {
      delete this.day
      delete this.month
      delete this.year
    }
  }
}

export class AppointmentBuilderDto {
  @ExposeDefault({ groups: [AppointmentWizardStep.Type] })
  @IsAppointmentType()
  type?: string | 'other'

  @ExposeDefault({ groups: [AppointmentWizardStep.Type] })
  @ValidateIf(object => object?.type === 'other', { groups: [AppointmentWizardStep.Type] })
  @IsAppointmentType()
  otherType?: string

  @ExposeDefault()
  typeDescription?: string

  @ExposeDefault()
  requiresLocation?: RequiredOptional

  @ExposeDefault({ groups: [AppointmentWizardStep.Where] })
  @ValidateIf(object => object?.requiresLocation === RequiredOptional.Required, {
    groups: [AppointmentWizardStep.Where],
  })
  @IsLocationCode()
  location?: string

  @ExposeDefault()
  locationDescription?: string

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @Type(() => AppointmentDateDto)
  @IsDateInput({ groups: [AppointmentWizardStep.When], message: 'Enter a valid date' })
  @IsFutureDate({ groups: [AppointmentWizardStep.When], message: 'Enter a date in the future' })
  @ValidateNested({ groups: [AppointmentWizardStep.When] })
  date: AppointmentDateDto

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsTime({ message: 'Enter a valid time', groups: [AppointmentWizardStep.When] })
  @IsFutureTime('date', { message: 'Enter a time in the future', groups: [AppointmentWizardStep.When] })
  startTime?: string

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsTime({ message: 'Enter a valid time', groups: [AppointmentWizardStep.When] })
  @IsAfter('startTime', { message: 'Enter an end time after the start time', groups: [AppointmentWizardStep.When] })
  endTime?: string

  @ExposeDefault({ groups: [AppointmentWizardStep.Sensitive] })
  @ToBoolean()
  @IsBoolean({ groups: [AppointmentWizardStep.Sensitive], message: MESSAGES.sensitive.required })
  sensitive?: boolean

  get contactType() {
    return this.type === 'other' ? this.otherType : this.type
  }

  get appointmentStart(): DateTime | null {
    return getDateTime(this.date.value, this.startTime)
  }

  get appointmentEnd(): DateTime {
    return getDateTime(this.date.value, this.endTime)
  }
}
