import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { sortBy } from 'lodash'
import { CommunityApiService, ContactMappingService } from '../../../community-api'
import { AppointmentListViewModel, AppointmentSummary, RecentAppointments } from './schedule.types'

export const MAX_RECENT_APPOINTMENTS = 20

@Injectable()
export class ScheduleService {
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getRecentAppointments(crn: string): Promise<RecentAppointments> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    const result: RecentAppointments = await data.reduce(async (aggregate, apt) => {
      const agg = await aggregate
      const collection =
        DateTime.fromISO(apt.appointmentStart) > now
          ? agg.future
          : agg.recent.length < MAX_RECENT_APPOINTMENTS
          ? agg.recent
          : agg.past
      const view: AppointmentListViewModel = {
        start: DateTime.fromISO(apt.appointmentStart),
        end: apt.appointmentEnd && DateTime.fromISO(apt.appointmentEnd),
        name: (await this.contacts.getTypeMeta(apt)).name,
        link: `/offender/${crn}/appointment/${apt.appointmentId}`,
      }
      collection.push(view)
      return agg
    }, Promise.resolve({ future: [], recent: [], past: [] }))

    result.future = sortBy(result.future, [x => x.start.toJSDate(), x => x.end?.toJSDate()])
    return result
  }

  async getAppointmentSummary(crn: string): Promise<AppointmentSummary> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    return await data.reduce(
      async (aggregate, apt) => {
        const agg = await aggregate
        const date = DateTime.fromISO(apt.appointmentStart)
        if (date > now) {
          // future appointment, consider it for the next appointment
          if (!agg.next || date < agg.next.date) {
            agg.next = { date, name: (await this.contacts.getTypeMeta(apt)).name }
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
      Promise.resolve({
        next: null,
        attendance: { acceptableAbsence: 0, complied: 0, failureToComply: 0 },
      } as AppointmentSummary),
    )
  }
}
