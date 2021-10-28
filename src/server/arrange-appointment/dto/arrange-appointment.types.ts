import { AppointmentType } from '../../community-api/client'
import { WellKnownAppointmentType } from '../../config'

export type MaybeWellKnownAppointmentType = AppointmentType & { wellKnownType?: WellKnownAppointmentType }
