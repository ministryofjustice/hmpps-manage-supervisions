import { AppointmentDetail } from '../../../community-api'
import { DateTime } from 'luxon'

export interface AppointmentListViewModel extends AppointmentDetail {
  name: string
  link: string
}

export interface RecentAppointments {
  future: AppointmentListViewModel[]
  recent: AppointmentListViewModel[]
  past: AppointmentListViewModel[]
}

export interface AppointmentSummary {
  next: {
    date: DateTime
    name: string
  } | null
  attendance: {
    complied: number
    acceptableAbsence: number
    failureToComply: number
  }
}
