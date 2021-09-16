import { AppointmentType, ContactType, StaffHuman } from '../client'
import {
  WellKnownAppointmentTypeMeta,
  WellKnownContactTypeMeta,
  ContactTypeCategory,
  WellKnownBreachEndContactTypeMeta,
} from '../../config'

export interface GetMetaOptions {
  type: ContactType | AppointmentType

  /**
   * Optional staff to append to appointment names e.g. 'Some appointment with John Doe'
   */
  staff?: StaffHuman
}

interface GetMetaResultBase<Type extends ContactTypeCategory, Meta = null> {
  name: string
  type: Type
  /**
   * Well known meta from config, otherwise null, which means the contact type 'category' is known but the type is not well known in config.
   */
  value: Meta | null
}

export type AppointmentMetaResult = GetMetaResultBase<ContactTypeCategory.Appointment, WellKnownAppointmentTypeMeta>

export type CommunicationMetaResult = GetMetaResultBase<ContactTypeCategory.Communication, WellKnownContactTypeMeta>

export type WarningLetterMetaResult = GetMetaResultBase<ContactTypeCategory.WarningLetter, {}>

export type UnknownMetaResult = GetMetaResultBase<ContactTypeCategory.Other>

export type BreachStartMetaResult = GetMetaResultBase<ContactTypeCategory.BreachStart, WellKnownContactTypeMeta>

export type BreachEndMetaResult = GetMetaResultBase<ContactTypeCategory.BreachEnd, WellKnownBreachEndContactTypeMeta>

export type SystemMetaResult = GetMetaResultBase<ContactTypeCategory.System>

export type GetMetaResult =
  | AppointmentMetaResult
  | CommunicationMetaResult
  | BreachStartMetaResult
  | BreachEndMetaResult
  | WarningLetterMetaResult
  | SystemMetaResult
  | UnknownMetaResult
