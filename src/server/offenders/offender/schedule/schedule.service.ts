import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { minBy, sortBy } from 'lodash'
import { CommunityApiService, ContactMappingService } from '../../../community-api'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule.types'
import { BreadcrumbType, LinksService } from '../../../common/links'
import { AppointmentDetail } from '../../../community-api/client'

export const MAX_RECENT_APPOINTMENTS = 20

@Injectable()
export class ScheduleService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly links: LinksService,
  ) {}

  async getScheduledAppointments(crn: string): Promise<AppointmentListViewModel[]> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()

    let result = await Promise.all(
      data
        .filter(apt => DateTime.fromISO(apt.appointmentStart).toISODate() >= now.toISODate())
        .map(apt => this.getAppointmentEntry(apt, crn)),
    )
    result = sortBy(result, [x => x.start.toJSDate(), x => x.end?.toJSDate()])
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
  private async getAppointmentEntry(apt: AppointmentDetail, crn: string): Promise<AppointmentListViewModel> {
    return {
      start: DateTime.fromISO(apt.appointmentStart),
      end: apt.appointmentEnd && DateTime.fromISO(apt.appointmentEnd),
      name: (await this.contacts.getTypeMeta(apt)).name,
      link: this.links.getUrl(BreadcrumbType.Appointment, { crn, id: apt.appointmentId }),
      today: DateTime.now().toISODate() === DateTime.fromISO(apt.appointmentStart).toISODate(),
    }
  }
}
