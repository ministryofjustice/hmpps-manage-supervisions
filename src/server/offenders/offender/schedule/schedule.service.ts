import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { minBy, sortBy } from 'lodash'
import { CommunityApiService, ContactMappingService } from '../../../community-api'
import { AppointmentListViewModel, NextAppointmentSummary, RecentAppointments } from './schedule.types'
import { BreadcrumbType, LinksService } from '../../../common/links'

export const MAX_RECENT_APPOINTMENTS = 20

@Injectable()
export class ScheduleService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly links: LinksService,
  ) {}

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
        link: this.links.getUrl(BreadcrumbType.Appointment, { crn, id: apt.appointmentId }),
      }
      collection.push(view)
      return agg
    }, Promise.resolve({ future: [], recent: [], past: [] }))

    result.future = sortBy(result.future, [x => x.start.toJSDate(), x => x.end?.toJSDate()])
    return result
  }

  async getNextAppointment(crn: string): Promise<NextAppointmentSummary | null> {
    const { data: appointments } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({
      crn,
      from: DateTime.now().toISODate(),
    })

    if (!appointments?.length) {
      return null
    }

    const nextAppointment = minBy(
      appointments.map(x => ({ ...x, date: DateTime.fromISO(x.appointmentStart) })),
      x => x.appointmentStart,
    )
    const meta = await this.contacts.getTypeMeta(nextAppointment)
    return { date: nextAppointment.date, name: meta.name }
  }
}
