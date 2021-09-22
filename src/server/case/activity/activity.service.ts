import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  ActivityLogEntry,
  ActivityLogGroup,
  ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  OffenderDetail,
} from '../../community-api/client'
import { CommunityApiService, ContactMappingService, Paginated } from '../../community-api'
import {
  ActivityComplianceFilter,
  CaseActivityLogEntry,
  CaseActivityLogGroup,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
  GetActivityLogOptions,
  UnknownActivityLogEntry,
} from './activity.types'
import { DateTime } from 'luxon'
import { ContactTypeCategory, WellKnownContactTypeConfig } from '../../config'
import { ConfigService } from '@nestjs/config'
import { BreachService } from '../../community-api/breach'
import { Mutable } from '../../@types/mutable'
import { ActivityLogEntryService, DatedActivityLogEntry } from './activity-log-entry.service'

export const PAGE_SIZE = 1000

type ContactApiRequest = Mutable<
  | ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest
  | ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest
>

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name)

  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly config: ConfigService,
    private readonly breach: BreachService,
    private readonly entryService: ActivityLogEntryService,
  ) {}

  async getActivityLogPage(
    crn: string,
    offender: OffenderDetail,
    { conviction, complianceFilter }: GetActivityLogOptions,
  ): Promise<Paginated<CaseActivityLogGroup>> {
    const filter = this.getCommonFilter(
      crn,
      // pagination is disabled in the design
      0,
      PAGE_SIZE,
      complianceFilter,
    ) as Mutable<ContactAndAttendanceApiGetActivityLogByCrnUsingGETRequest>

    if (complianceFilter) {
      filter.convictionId = conviction.id
      await this.setComplianceFromDate(filter)
    } else {
      filter.convictionDatesOf = conviction.id
    }

    const { data: result } = await this.community.contactAndAttendance.getActivityLogByCrnUsingGET(filter)
    if (!result.last) {
      this.logger.error('activity log has been truncated', { crn, convictionId: conviction.id })
    }

    const today = DateTime.now().startOf('day')
    const groups: CaseActivityLogGroup[] = result.content.map(grp => {
      const date = DateTime.fromISO(grp.date)
      return {
        date,
        isToday: date.equals(today),
        entries: grp.entries.map(entry => this.getActivityLogEntry(crn, grp, entry, offender)),
      }
    })

    return {
      totalPages: 1,
      first: true,
      last: true,
      number: 0,
      size: groups.length,
      totalElements: groups.length,
      content: groups,
    }
  }

  async getActivityLogComplianceCount(
    crn: string,
    convictionId: number,
    complianceFilter: ActivityComplianceFilter,
    from: DateTime | null,
  ) {
    // to get the appointment counts here we're using the totalElements property of the list api
    // but requesting a single item on a single page and discarding the result.
    const filter = this.getCommonFilter(
      crn,
      0,
      1, // we only need the count so a page size of 1 is fine.
      complianceFilter,
    )

    filter.convictionId = convictionId
    filter.contactDateFrom = from === null ? null : from?.toISODate() // we need to be careful to preserve null here
    await this.setComplianceFromDate(filter)

    // RAR is a special case because it is deduplicated by day, so to count it we use the activity log api
    const { data } =
      complianceFilter === ActivityComplianceFilter.RarActivity
        ? await this.community.contactAndAttendance.getActivityLogByCrnUsingGET(filter)
        : await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET(filter)
    return data.totalElements
  }

  async getAppointment(crn: string, appointmentId: number): Promise<AppointmentActivityLogEntry> {
    const { data: appointment } = await this.community.appointment.getOffenderAppointmentByCrnUsingGET({
      crn,
      appointmentId,
    })

    const meta = this.contacts.getTypeMeta(appointment)
    if (meta.type !== ContactTypeCategory.Appointment) {
      throw new NotFoundException(`contact with id '${appointmentId}' is not an appointment`)
    }

    return this.entryService.getAppointmentActivityLogEntry(crn, appointment, meta)
  }

  async getCommunicationContact(
    crn: string,
    contactId: number,
    offender: OffenderDetail,
  ): Promise<CommunicationActivityLogEntry> {
    const { data: contact } = await this.community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET({
      crn,
      contactId,
    })
    const meta = this.contacts.getTypeMeta(contact)
    if (meta.type !== ContactTypeCategory.Communication) {
      throw new NotFoundException(`contact with id '${contactId}' is not a communication`)
    }
    return this.entryService.getCommunicationActivityLogEntry(crn, contact, meta, offender)
  }

  async getUnknownContact(crn: string, contactId: number): Promise<UnknownActivityLogEntry> {
    const { data: contact } = await this.community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET({
      crn,
      contactId,
    })
    const meta = this.contacts.getTypeMeta(contact)
    if (meta.type === ContactTypeCategory.Appointment) {
      throw new NotFoundException(`contact with id '${contactId}' is not an appointment`)
    }
    if (meta.type === ContactTypeCategory.Communication) {
      throw new NotFoundException(`contact with id '${contactId}' is not a communication`)
    }
    return this.entryService.getUnknownActivityLogEntry(crn, contact, meta)
  }

  private getActivityLogEntry(
    crn: string,
    group: ActivityLogGroup,
    entry: ActivityLogEntry,
    offender: OffenderDetail,
  ): CaseActivityLogEntry {
    const meta = this.contacts.getTypeMeta(entry)
    const datedEntry: DatedActivityLogEntry = { ...entry, date: group.date }
    switch (meta.type) {
      case ContactTypeCategory.Appointment:
        return this.entryService.getAppointmentActivityLogEntry(crn, datedEntry, meta)
      case ContactTypeCategory.Communication:
        return this.entryService.getCommunicationActivityLogEntry(crn, datedEntry, meta, offender)
      case ContactTypeCategory.System:
        return this.entryService.getSystemActivityLogEntry(crn, datedEntry, meta)
      default:
        return this.entryService.getUnknownActivityLogEntry(crn, datedEntry, meta)
    }
  }

  private async setComplianceFromDate(filters: ContactApiRequest) {
    if (filters.contactDateFrom) {
      // a client service already ser the date from, we assume here that the service set the correct date and avoid the extra IO
      return
    }

    // any compliance filter implies that the log is filtered by the latter of the last breach end or the last 12 months
    // an existing from date of null has a special meaning: 'I already checked the last breach end date, dont check again'
    if (filters.contactDateFrom !== null && filters.convictionId) {
      const breaches = await this.breach.getBreaches(filters.crn, filters.convictionId, {
        includeOutcome: false,
      })
      if (breaches?.lastRecentBreachEnd) {
        filters.contactDateFrom = breaches.lastRecentBreachEnd.toISODate()
      }
    }

    if (!filters.contactDateFrom) {
      // fallback to last 12 months
      filters.contactDateFrom = DateTime.now().minus({ years: 1 }).toISODate()
    }
  }

  private getCommonFilter(
    crn: string,
    page: number,
    pageSize: number,
    complianceFilter?: ActivityComplianceFilter,
    contactDateFrom?: DateTime,
  ): ContactApiRequest {
    const request: ContactApiRequest = {
      crn,
      page,
      pageSize,
      contactDateFrom: contactDateFrom && contactDateFrom.toISODate(),
      // all activity logs are filtered to today and earlier
      contactDateTo: DateTime.now().plus({ days: 1 }).toISODate(),
    }

    function appointment(appointmentOptions: { outcome?: boolean; complied?: boolean; attended?: boolean }) {
      request.appointmentsOnly = true
      request.nationalStandard = true
      request.outcome = appointmentOptions.outcome
      request.complied = appointmentOptions.complied
      request.attended = appointmentOptions.attended
    }

    switch (complianceFilter) {
      case ActivityComplianceFilter.Appointments:
        appointment({})
        break
      case ActivityComplianceFilter.WithoutOutcome:
        appointment({ outcome: false })
        break
      case ActivityComplianceFilter.CompliedAppointments:
        appointment({ complied: true, attended: true })
        break
      case ActivityComplianceFilter.FailedToComplyAppointments:
        appointment({ complied: false })
        break
      case ActivityComplianceFilter.AcceptableAbsenceAppointments:
        appointment({ complied: true, attended: false })
        break
      case ActivityComplianceFilter.WarningLetters:
        request.contactTypes = Object.values(
          this.config.get<WellKnownContactTypeConfig>('contacts')[ContactTypeCategory.WarningLetter],
        )
        break
      case ActivityComplianceFilter.RarActivity:
        request.rarActivity = true
        break
    }

    return request
  }
}
