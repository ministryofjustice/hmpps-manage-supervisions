import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { sortBy } from 'lodash'
import { CommunityApiService } from '../../../community-api'
import { ContactMappingService } from '../../../common'
import { AppointmentListViewModel, AppointmentSummary, RecentAppointments } from './schedule.types'

export const MAX_RECENT_APPOINTMENTS = 20

@Injectable()
export class ScheduleService {
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getRecentAppointments(crn: string): Promise<RecentAppointments> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    const result: RecentAppointments = data.reduce(
      (agg, apt) => {
        const collection =
          DateTime.fromISO(apt.appointmentStart) > now
            ? agg.future
            : agg.recent.length < MAX_RECENT_APPOINTMENTS
            ? agg.recent
            : agg.past
        const view: AppointmentListViewModel = {
          ...apt,
          name: this.contacts.getTypeMeta(apt).name,
          link: `/offender/${crn}/appointment/${apt.appointmentId}`,
        }
        collection.push(view)
        return agg
      },
      { future: [], recent: [], past: [] },
    )

    result.future = sortBy(
      result.future,
      x => x.appointmentStart,
      x => x.appointmentEnd,
    )

    return result
  }

  async getAppointmentSummary(crn: string): Promise<AppointmentSummary> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    return data.reduce(
      (agg, apt) => {
        const date = DateTime.fromISO(apt.appointmentStart)
        if (date > now) {
          // future appointment, consider it for the next appointment
          if (!agg.next || date < agg.next.date) {
            agg.next = { date, name: this.contacts.getTypeMeta(apt).name }
          }
          return agg
        }

        // past appointment, check it's compliance
        if (apt.outcome) {
          if (apt.outcome.complied) {
            if (apt.outcome.attended) {
              agg.attendance.complied++
            } else {
              agg.attendance.acceptableAbsence++
            }
          } else {
            agg.attendance.failureToComply++
          }
        }
        return agg
      },
      {
        next: null,
        attendance: { acceptableAbsence: 0, complied: 0, failureToComply: 0 },
      } as AppointmentSummary,
    )
  }
}
