import { DateTime } from 'luxon'

export interface AppointmentListViewModel {
  name: string
  link: string
  start: DateTime
  end: DateTime
  today: boolean
}

export interface NextAppointmentSummary {
  date: DateTime
  name: string
}
