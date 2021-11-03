import { Transform, Type } from 'class-transformer'
import { DateTime } from 'luxon'
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsPositive, IsString, ValidateIf, ValidateNested } from 'class-validator'
import striptags = require('striptags')
import { DateInput, IsAfter, IsDateInput, IsFutureTime, ValidationGroup, IsFutureDate, IsTime } from '../../validators'
import { getDateTime } from '../../util'
import { ExposeDefault, ToBoolean } from '../../util/mapping'
import { AppointmentTypeRequiresLocation, OffenderDetail, OfficeLocation } from '../../community-api/client'
import { WellKnownAppointmentType } from '../../config'
import {
  AlternateLocation,
  AppointmentBookingUnavailableReason,
  AppointmentWizardStep,
} from './arrange-appointment.types'

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
  addNotes: {
    required: 'Select yes if you would like to add notes',
  },
  sensitive: {
    required: 'Select yes if the appointment contains sensitive information',
  },
}

function IsAppointmentType(featured: boolean) {
  const decorators = [IsString, IsNotEmpty]
  if (featured) {
    decorators.push(options => IsIn([...Object.values(WellKnownAppointmentType), 'other'], options))
  }
  return ValidationGroup({ message: MESSAGES.type.required, groups: [AppointmentWizardStep.Type] }, ...decorators)
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

    return DateTime.fromObject({ day: this.day, month: this.month, year: this.year })
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
  @ExposeDefault()
  offender?: OffenderDetail

  @ExposeDefault()
  providerCode?: string

  @ExposeDefault()
  requirementId?: number

  @ExposeDefault()
  staffCode?: string

  @ExposeDefault()
  teamCode?: string

  @ExposeDefault()
  convictionId?: number

  @ExposeDefault({ groups: [AppointmentWizardStep.Type] })
  @IsAppointmentType(true)
  type?: WellKnownAppointmentType | 'other'

  @ExposeDefault({ groups: [AppointmentWizardStep.Type] })
  @ValidateIf(object => object?.type === 'other', { groups: [AppointmentWizardStep.Type] })
  @IsAppointmentType(false)
  otherType?: string

  @ExposeDefault()
  typeDescription?: string

  @ExposeDefault()
  requiresLocation?: AppointmentTypeRequiresLocation

  @ExposeDefault()
  availableLocations?: OfficeLocation[]

  @ExposeDefault()
  alternateLocations?: AlternateLocation[]

  @ExposeDefault({ groups: [AppointmentWizardStep.Where] })
  @ValidateIf(object => object?.requiresLocation !== AppointmentTypeRequiresLocation.NotRequired, {
    groups: [AppointmentWizardStep.Where],
  })
  @IsLocationCode()
  location?: string

  @ExposeDefault()
  locationDescription?: string

  @ExposeDefault()
  cja2003Order: boolean

  @ExposeDefault()
  legacyOrder: boolean

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @Type(() => AppointmentDateDto)
  @IsDateInput({ groups: [AppointmentWizardStep.When], message: 'Enter a valid date' })
  @IsFutureDate({ groups: [AppointmentWizardStep.When], message: 'Enter a date in the future' })
  @ValidateNested({ groups: [AppointmentWizardStep.When] })
  date: AppointmentDateDto

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsTime({ message: 'Enter a valid start time, such as 12:15pm', groups: [AppointmentWizardStep.When] })
  @IsFutureTime('date', { message: 'Enter a time in the future', groups: [AppointmentWizardStep.When] })
  startTime?: string

  @ExposeDefault({ groups: [AppointmentWizardStep.When] })
  @IsTime({ message: 'Enter a valid end time, such as 12:30pm', groups: [AppointmentWizardStep.When] })
  @IsAfter('startTime', { message: 'Enter an end time after the start time', groups: [AppointmentWizardStep.When] })
  endTime?: string

  @ExposeDefault({ groups: [AppointmentWizardStep.Sensitive] })
  @ToBoolean()
  @IsBoolean({ groups: [AppointmentWizardStep.Sensitive], message: MESSAGES.sensitive.required })
  sensitive?: boolean

  @ExposeDefault({ groups: [AppointmentWizardStep.AddNotes] })
  @ToBoolean()
  @IsBoolean({ groups: [AppointmentWizardStep.AddNotes], message: MESSAGES.addNotes.required })
  addNotes?: boolean

  @ExposeDefault({ groups: [AppointmentWizardStep.Notes] })
  @Transform(({ value }) => striptags(value))
  notes?: string

  @ExposeDefault()
  unavailableReason?: AppointmentBookingUnavailableReason

  get appointmentType(): null | { value: WellKnownAppointmentType | string; featured: boolean } {
    if (!this.type) {
      return null
    }
    if (this.type === 'other') {
      return this.otherType ? { value: this.otherType, featured: false } : null
    }
    return { value: this.type, featured: true }
  }

  get appointmentStart(): DateTime | null {
    return getDateTime(this.date.value, this.startTime)
  }

  get appointmentEnd(): DateTime {
    return getDateTime(this.date.value, this.endTime)
  }
}
