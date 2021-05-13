import { Transform, Type } from 'class-transformer'
import { DateTime } from 'luxon'

export class AppointmentMetaType {
  description: string
  code: string
}

/**
 * TODO for validation, this probably needs to be split up into steps
 * OR, keep it as a single dto & use class-validator groups to validate each step
 */
export class AppointmentBuilderDto {
  @Type(() => Number)
  requirementId: number

  @Type(() => AppointmentMetaType)
  contactType: AppointmentMetaType

  @Type(() => AppointmentMetaType)
  nsiType?: AppointmentMetaType

  @Type(() => AppointmentMetaType)
  nsiSubType?: AppointmentMetaType

  @Transform(({ value }) => (value ? DateTime.fromISO(value) : null))
  appointmentStart: DateTime

  @Transform(({ value }) => (value ? DateTime.fromISO(value) : null))
  appointmentEnd: DateTime

  officeLocationCode?: string

  notes: string

  providerCode: string

  teamCode: string

  staffCode: string

  @Type(() => Number)
  sentenceId: number
}
