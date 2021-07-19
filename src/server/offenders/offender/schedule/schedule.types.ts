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
