import { AppointmentDetail } from '../../../community-api'

export interface AppointmentListViewModel extends AppointmentDetail {
  name: string
  link: string
}

export interface RecentAppointments {
  future: AppointmentListViewModel[]
  recent: AppointmentListViewModel[]
  past: AppointmentListViewModel[]
}
