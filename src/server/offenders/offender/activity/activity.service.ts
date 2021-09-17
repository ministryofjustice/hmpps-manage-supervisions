import { Injectable, NotFoundException } from '@nestjs/common'
import { groupBy, orderBy } from 'lodash'
import {
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
  OffenderDetail,
} from '../../../community-api/client'
import { CommunityApiService, ContactMappingService, Paginated } from '../../../community-api'
import {
  ActivityComplianceFilter,
  ActivityLogEntry,
  ActivityLogEntryGroup,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
  UnknownActivityLogEntry,
} from './activity.types'
import { DateTime } from 'luxon'
import { ContactTypeCategory, WellKnownContactTypeConfig } from '../../../config'
import { ConfigService } from '@nestjs/config'
import { BreachService } from '../../../community-api/breach'
import { Mutable } from '../../../@types/mutable'
import { ActivityLogEntryService } from './activity-log-entry.service'

export const PAGE_SIZE = 1000

export type GetContactsOptions = Omit<
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  'crn' | 'contactDateTo' | 'page' | 'pageSize'
> & { complianceFilter?: ActivityComplianceFilter }

@Injectable()
export class ActivityService {
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
    options: GetContactsOptions = {},
  ): Promise<Paginated<ActivityLogEntryGroup>> {
    const resolvedOptions = await this.constructContactFilter(crn, options)
    const {
      data: { content: contacts = [] },
    } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET({
      ...resolvedOptions,
      // TODO pagination is disabled
      page: 0,
      pageSize: PAGE_SIZE,
    })

    // TODO filtering out system generated contacts for now
    const entries = await Promise.all(
      contacts.filter(x => !x.type.systemGenerated).map(contact => this.getActivityLogEntry(crn, contact, offender)),
    )
    const today = DateTime.now().startOf('day')
    const groups: ActivityLogEntryGroup[] = Object.entries(groupBy(entries, x => x.start.toISODate())).map(
      ([key, entries]) => {
        const date = DateTime.fromISO(key)
        return { date, isToday: date.equals(today), entries: orderBy(entries, x => x.start) }
      },
    )
    return {
      totalPages: 1,
      first: true,
      last: true,
      number: 0,
      size: groups.length,
      totalElements: groups.length,
      content: orderBy(groups, x => x.date, 'desc'),
    }
  }

  async getActivityLogComplianceCount(
    crn: string,
    convictionId: number,
    filter: ActivityComplianceFilter,
    from: DateTime | null,
  ) {
    // to get the appointment counts here we're using the totalElements property of the list api
    // but requesting a single item on a single page and discarding the result.
    const resolvedOptions = await this.constructContactFilter(crn, {
      convictionId,
      complianceFilter: filter,
      // we need to be careful to preserve a null contactDateFrom from a null lastRecentBreachEnd here
      // as it has a special meaning: 'I already checked the last breach end date, dont check again'
      contactDateFrom: from?.toISODate(),
    })
    const { data } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET({
      ...resolvedOptions,
      pageSize: 1, // we only need the count so a page size of 1 is fine.
    })
    return data.totalElements
  }

  async getAppointment(crn: string, appointmentId: number): Promise<AppointmentActivityLogEntry> {
    const { data: appointment } = await this.community.appointment.getOffenderAppointmentByCrnUsingGET({
      crn,
      appointmentId,
    })

    const meta = await this.contacts.getTypeMeta(appointment)
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
    const meta = await this.contacts.getTypeMeta(contact)
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
    const meta = await this.contacts.getTypeMeta(contact)
    if (meta.type === ContactTypeCategory.Appointment) {
      throw new NotFoundException(`contact with id '${contactId}' is not an appointment`)
    }
    if (meta.type === ContactTypeCategory.Communication) {
      throw new NotFoundException(`contact with id '${contactId}' is not a communication`)
    }
    return this.entryService.getUnknownActivityLogEntry(crn, contact, meta)
  }

  private async getActivityLogEntry(
    crn: string,
    contact: ContactSummary,
    offender: OffenderDetail,
  ): Promise<ActivityLogEntry> {
    const meta = await this.contacts.getTypeMeta(contact)
    switch (meta.type) {
      case ContactTypeCategory.Appointment:
        return this.entryService.getAppointmentActivityLogEntry(crn, contact, meta)
      case ContactTypeCategory.Communication:
        return this.entryService.getCommunicationActivityLogEntry(crn, contact, meta, offender)
      default:
        return this.entryService.getUnknownActivityLogEntry(crn, contact, meta)
    }
  }

  private async constructContactFilter(
    crn: string,
    { complianceFilter, ...options }: GetContactsOptions,
  ): Promise<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest> {
    const defaultFilters: Mutable<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest> = {
      crn,
      contactDateTo: DateTime.now().plus({ days: 1 }).toISODate(),
      ...options,
    }

    // any compliance filter implies that the log is filtered by the latter of the last breach end or the last 12 months
    if (complianceFilter && !defaultFilters.contactDateFrom) {
      // so first attempt to get default 'contact from date' from last breach
      // this is short circuited when contactDateFrom is null so client can specify not wanting to check last breach
      if (defaultFilters.contactDateFrom !== null && defaultFilters.convictionId) {
        const breaches = await this.breach.getBreaches(crn, defaultFilters.convictionId, { includeOutcome: false })
        if (breaches?.lastRecentBreachEnd) {
          defaultFilters.contactDateFrom = breaches.lastRecentBreachEnd.toISODate()
        }
      }

      // otherwise fallback to the last 12 months
      // regardless of provided contactDateFrom being null, we default it to the last 12 months here
      if (!defaultFilters.contactDateFrom) {
        defaultFilters.contactDateFrom = DateTime.now().minus({ years: 1 }).toISODate()
      }
    }

    const defaultAppointmentFilters = { ...defaultFilters, appointmentsOnly: true, nationalStandard: true }

    switch (complianceFilter) {
      case ActivityComplianceFilter.Appointments:
        return defaultAppointmentFilters
      case ActivityComplianceFilter.WithoutOutcome:
        return { ...defaultAppointmentFilters, outcome: false }
      case ActivityComplianceFilter.CompliedAppointments:
        return { ...defaultAppointmentFilters, complied: true, attended: true }
      case ActivityComplianceFilter.AcceptableAbsenceAppointments:
        return { ...defaultAppointmentFilters, complied: true, attended: false }
      case ActivityComplianceFilter.FailedToComplyAppointments:
        return { ...defaultAppointmentFilters, complied: false }
      case ActivityComplianceFilter.WarningLetters:
        const contactTypes = Object.values(
          this.config.get<WellKnownContactTypeConfig>('contacts')[ContactTypeCategory.WarningLetter],
        )
        return { ...defaultFilters, contactTypes }
      default:
        return defaultFilters
    }
  }
}
