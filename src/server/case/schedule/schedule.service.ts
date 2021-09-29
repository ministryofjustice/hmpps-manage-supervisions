import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { minBy, sortBy } from 'lodash'
import { CommunityApiService, ContactMappingService } from '../../community-api'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule.types'
import { BreadcrumbType, LinksService } from '../../common/links'

@Injectable()
export class ScheduleService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly links: LinksService,
  ) {}

  async getScheduledAppointments(crn: string): Promise<AppointmentListViewModel[]> {
    const now = DateTime.now()
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({
      crn,
      from: now.toISODate(),
    })
    const result: AppointmentListViewModel[] = data.map(apt => ({
      start: DateTime.fromISO(apt.appointmentStart),
      end: apt.appointmentEnd && DateTime.fromISO(apt.appointmentEnd),
      name: this.contacts.getTypeMeta(apt).name,
      link: this.links.getUrl(BreadcrumbType.Appointment, { crn, id: apt.appointmentId }),
      today: now.toISODate() === DateTime.fromISO(apt.appointmentStart).toISODate(),
    }))
    return sortBy(result, [x => x.start.toJSDate(), x => x.end?.toJSDate()])
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
