import { AppointmentType, ContactType, StaffHuman } from '../../community-api'
import {
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationTypeMeta,
  WellKnownContactTypeCategory,
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
  type: WellKnownContactTypeCategory | null
  value: Meta
}

export interface AppointmentMetaResult extends GetMetaResultBase<WellKnownAppointmentTypeMeta> {
  type: WellKnownContactTypeCategory.Appointment
}

export interface CommunicationMetaResult extends GetMetaResultBase<WellKnownCommunicationTypeMeta> {
  type: WellKnownContactTypeCategory.Communication
}

export interface UnknownMetaResult extends GetMetaResultBase<{ appointment: boolean }> {
  type: null
}

export type GetMetaResult = AppointmentMetaResult | CommunicationMetaResult | UnknownMetaResult

export function isAppointment(result: GetMetaResult): boolean {
  return (
    result.type === WellKnownContactTypeCategory.Appointment ||
    ('appointment' in result.value && result.value.appointment)
  )
}
