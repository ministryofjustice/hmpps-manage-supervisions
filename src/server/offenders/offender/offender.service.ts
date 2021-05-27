import { Injectable } from '@nestjs/common'
import { CommunityApiService, OffenderDetail } from '../../community-api'
import { DateTime } from 'luxon'
import { AppointmentListViewModel, RecentAppointments } from './offender-view-model'

export const MAX_RECENT_APPOINTMENTS = 20

@Injectable()
export class OffenderService {
  constructor(private readonly community: CommunityApiService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getRecentAppointments(crn: string): Promise<RecentAppointments> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    return data.reduce(
      (agg, apt) => {
        const collection =
          DateTime.fromISO(apt.appointmentStart) > now
            ? agg.future
            : agg.recent.length < MAX_RECENT_APPOINTMENTS
            ? agg.recent
            : agg.past
        const view: AppointmentListViewModel = {
          ...apt,
          // TODO map description through well known contact types...
          name: `${apt.type.description} with ${[apt.staff.forenames, apt.staff.surname].join(' ')}`,
          href: `/offender/${crn}/appointment/${apt.appointmentId}`,
        }
        collection.push(view)
        return agg
      },
      { future: [], recent: [], past: [] },
    )
  }
}
