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

interface GetMetaResultBase<Meta> {
  name: string
  type: ContactTypeCategory
  value: Meta
}

export interface AppointmentMetaResult extends GetMetaResultBase<WellKnownAppointmentTypeMeta> {
  type: ContactTypeCategory.Appointment
}

export interface CommunicationMetaResult extends GetMetaResultBase<WellKnownContactTypeMeta> {
  type: ContactTypeCategory.Communication
}

export interface UnknownMetaResult
  extends GetMetaResultBase<{ name: string; appointment: boolean; communication: boolean }> {
  type: ContactTypeCategory.Communication | ContactTypeCategory.Other | ContactTypeCategory.WarningLetter
}

export interface BreachStartMetaResult extends GetMetaResultBase<WellKnownContactTypeMeta> {
  type: ContactTypeCategory.BreachStart
}

export interface BreachEndMetaResult extends GetMetaResultBase<WellKnownBreachEndContactTypeMeta> {
  type: ContactTypeCategory.BreachEnd
}

export type GetMetaResult =
  | AppointmentMetaResult
  | CommunicationMetaResult
  | BreachStartMetaResult
  | BreachEndMetaResult
  | UnknownMetaResult

export function isAppointment(result: GetMetaResult): boolean {
  return result.type === ContactTypeCategory.Appointment || ('appointment' in result.value && result.value.appointment)
}

export function isCommunication(result: GetMetaResult): boolean {
  return (
    result.type === ContactTypeCategory.Communication || ('communication' in result.value && result.value.communication)
  )
}
