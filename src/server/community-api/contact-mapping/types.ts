import { AppointmentType, ContactType, StaffHuman } from '../client'
import { WellKnownAppointmentTypeMeta, WellKnownCommunicationTypeMeta, ContactTypeCategory } from '../../config'

export interface GetMetaOptions {
  type: ContactType | AppointmentType

  /**
   * Optional staff to append to appointment names e.g. 'Some appointment with John Doe'
   */
  staff?: StaffHuman
}

interface GetMetaResultBase<Meta> {
  name: string
  type: ContactTypeCategory | null
  value: Meta
}

export interface AppointmentMetaResult extends GetMetaResultBase<WellKnownAppointmentTypeMeta> {
  type: ContactTypeCategory.Appointment
}

export interface CommunicationMetaResult extends GetMetaResultBase<WellKnownCommunicationTypeMeta> {
  type: ContactTypeCategory.Communication
}

export interface UnknownMetaResult
  extends GetMetaResultBase<{ name: string; appointment: boolean; communication: boolean }> {
  type: ContactTypeCategory.Communication | ContactTypeCategory.Other | ContactTypeCategory.WarningLetter | null
}

export type GetMetaResult = AppointmentMetaResult | CommunicationMetaResult | UnknownMetaResult

export function isAppointment(result: GetMetaResult): boolean {
  return result.type === ContactTypeCategory.Appointment || ('appointment' in result.value && result.value.appointment)
}

export function isCommunication(result: GetMetaResult): boolean {
  return (
    result.type === ContactTypeCategory.Communication || ('communication' in result.value && result.value.communication)
  )
}
