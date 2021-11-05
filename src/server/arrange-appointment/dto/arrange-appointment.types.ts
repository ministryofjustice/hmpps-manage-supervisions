import { AppointmentType } from '../../community-api/client'
import { WellKnownAppointmentType } from '../../config'

export type MaybeWellKnownAppointmentType = AppointmentType & { wellKnownType?: WellKnownAppointmentType }

export enum AppointmentBookingUnavailableReason {
  NewLocationRequired = 'new-location-required',
  CountsTowardsRar = 'counts-towards-rar',
}

export interface AlternateLocation {
  code: string
  description: string
}

export const UNAVAILABLE_LOCATION: AlternateLocation = Object.freeze({
  code: 'UNAVAILABLE_LOCATION',
  description: 'The location I’m looking for is not in this list',
})

export const NO_LOCATION: AlternateLocation = Object.freeze({
  code: 'NO_LOCATION',
  description: 'I do not need to pick a location',
})

export enum AppointmentWizardStep {
  Type = 'type',
  Rar = 'rar',
  Where = 'where',
  When = 'when',
  Sensitive = 'sensitive',
  AddNotes = 'add-notes',
  Notes = 'notes',
  Check = 'check',
  Confirm = 'confirm',
  Unavailable = 'unavailable',
}
