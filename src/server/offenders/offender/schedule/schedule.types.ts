import { DateTime } from 'luxon'

export interface AppointmentListViewModel {
  name: string
  link: string
  start: DateTime
  end: DateTime
}

export interface RecentAppointments {
  future: AppointmentListViewModel[]
  recent: AppointmentListViewModel[]
  past: AppointmentListViewModel[]
}

export interface NextAppointmentSummary {
  date: DateTime
  name: string
}
