import { Injectable } from '@nestjs/common'
import {
  AppointmentDetail,
  AppointmentOutcome,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
} from '../../../community-api/client'
import {
  CommunicationMetaResult,
  CommunityApiService,
  ContactMappingService,
  GetMetaResult,
  isAppointment,
  Paginated,
} from '../../../community-api'
import {
  ActivityComplianceFilter,
  ActivityLogEntry,
  ActivityLogEntryBase,
  ActivityLogEntryTag,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
} from './activity.types'
import { DateTime } from 'luxon'
import { ContactTypeCategory, WellKnownContactTypeConfig } from '../../../config'
import { BreadcrumbType, LinksService } from '../../../common/links'
import { ConfigService } from '@nestjs/config'
import { BreachService } from '../../../community-api/breach'
import { Mutable } from '../../../@types/mutable'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

export type GetContactsOptions = Omit<
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  'crn' | 'contactDateTo'
> & { complianceFilter?: ActivityComplianceFilter }

function getOutcomeFlags(outcome?: AppointmentOutcome): ActivityLogEntryTag[] {
  switch (outcome?.complied) {
    case true:
      return [{ name: outcome.attended ? 'complied' : 'acceptable absence', colour: GovUkUiTagColour.Green }]
    case false:
      return [{ name: outcome.attended ? 'failed to comply' : 'unacceptable absence', colour: GovUkUiTagColour.Red }]
    default:
      return []
  }
}

function getAppointmentFlags(contact: ContactSummary | AppointmentDetail): ActivityLogEntryTag[] {
  const tags: ActivityLogEntryTag[] = []

  if (contact.type.nationalStandard) {
    tags.push({ name: 'national standard (ns)', colour: GovUkUiTagColour.Grey })
  }

  if (contact.sensitive) {
    tags.push({ name: 'sensitive', colour: GovUkUiTagColour.Grey })
  }

  if (contact.rarActivity) {
    tags.push({ name: 'rar', colour: GovUkUiTagColour.Purple })
  }

  return tags
}

@Injectable()
export class ActivityService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly links: LinksService,
    private readonly config: ConfigService,
    private readonly breach: BreachService,
  ) {}

  async getActivityLogPage(
    crn: string,
    offenderName: string,
    options: GetContactsOptions = {},
  ): Promise<Paginated<ActivityLogEntry>> {
    const resolvedOptions = await this.constructContactFilter(crn, options)
    const {
      data: { totalPages, first, last, number, size, totalElements, content: contacts = [] },
    } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET(resolvedOptions)

    const content = await Promise.all(contacts.map(contact => this.getActivityLogEntry(crn, contact, offenderName)))
    return { totalPages, first, last, number, size, totalElements, content }
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
      pageSize: 1,
    })
    const { data } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET(resolvedOptions)
    return data.totalElements
  }

  async getAppointment(crn: string, appointmentId: number): Promise<AppointmentActivityLogEntry> {
    const { data: appointment } = await this.community.appointment.getOffenderAppointmentByCrnUsingGET({
      crn,
      appointmentId,
    })

    const meta = await this.contacts.getTypeMeta(appointment)
    if (!isAppointment(meta)) {
      throw new Error(`cannot determine that appointment with id '${appointmentId}' is a valid appointment`)
    }

    return this.getAppointmentActivityLogEntry(crn, appointment, meta)
  }

  async getCommunicationContact(
    crn: string,
    contactId: number,
    offenderName: string,
  ): Promise<CommunicationActivityLogEntry> {
    const { data: contact } = await this.community.contactAndAttendance.getOffenderContactSummaryByCrnUsingGET({
      crn,
      contactId,
    })
    const meta = await this.contacts.getTypeMeta(contact)
    const base = ActivityService.getActivityLogEntryBase(contact)
    return this.getCommunicationActivityLogEntry(crn, contact, meta, base, offenderName)
  }

  private async getActivityLogEntry(
    crn: string,
    contact: ContactSummary,
    offenderName: string,
  ): Promise<ActivityLogEntry> {
    const meta = await this.contacts.getTypeMeta(contact)

    if (isAppointment(meta)) {
      // is either a well-known or 'other' appointment
      return this.getAppointmentActivityLogEntry(crn, contact, meta)
    }

    const base = ActivityService.getActivityLogEntryBase(contact)

    if (meta.type === ContactTypeCategory.Communication) {
      // is a communication type (either known, or in the CAPI Communication category)
      return this.getCommunicationActivityLogEntry(crn, contact, meta, base, offenderName)
    }

    // is unknown contact
    return {
      ...base,
      type: ContactTypeCategory.Other,
      category: 'Unclassified contact',
      name: meta.name,
      typeName: meta.value.name,
      tags: [],
      links: null,
    }
  }

  private getAppointmentActivityLogEntry(
    crn: string,
    contact: AppointmentDetail | ContactSummary,
    meta: GetMetaResult,
  ): AppointmentActivityLogEntry {
    function isAppointment(value: any): value is AppointmentDetail {
      return 'appointmentStart' in value
    }

    const {
      id,
      start: startIso,
      end: endIso,
      requirement = null,
    } = isAppointment(contact)
      ? {
          id: contact.appointmentId,
          start: contact.appointmentStart,
          end: contact.appointmentEnd,
          requirement: contact.requirement,
        }
      : { id: contact.contactId, start: contact.contactStart, end: contact.contactEnd, requirement: null }

    const start = DateTime.fromISO(startIso)
    const outcomeFlags = [...getAppointmentFlags(contact), ...getOutcomeFlags(contact.outcome)]
    const missingOutcome = outcomeFlags.length === 0 && start <= DateTime.now()
    const links = this.links.of({ id, crn })
    return {
      id,
      start,
      notes: contact.notes,
      sensitive: contact.sensitive || false,
      type: ContactTypeCategory.Appointment,
      category: `${start > DateTime.now() ? 'Future' : 'Previous'} appointment`,
      name: meta.name,
      typeName: meta.value.name,
      end: endIso && DateTime.fromISO(endIso),
      tags: [...outcomeFlags],
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
        recordMissingAttendance: missingOutcome ? links.url(BreadcrumbType.ExitToDelius) : null,
      },
      rarActivity: contact.rarActivity || false,
      requirement,
      outcome: contact.outcome
        ? {
            complied: contact.outcome.complied,
            attended: contact.outcome.attended,
            description: contact.outcome.description,
          }
        : null,
    }
  }

  private getCommunicationActivityLogEntry(
    crn: string,
    contact: ContactSummary,
    meta: GetMetaResult,
    base: Pick<ActivityLogEntryBase, 'id' | 'start' | 'notes' | 'sensitive'>,
    offenderName: string,
  ): CommunicationActivityLogEntry {
    const links = this.links.of({ id: contact.contactId, crn })
    return {
      ...base,
      type: ContactTypeCategory.Communication,
      category: 'Other communication',
      name: (meta as CommunicationMetaResult).value.description
        ? (meta as CommunicationMetaResult).value.description.replace('{}', offenderName)
        : meta.name,
      typeName: meta.value.name,
      tags: [],
      links: {
        view: links.url(BreadcrumbType.OtherCommunication),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
      },
      lastUpdatedDateTime: DateTime.fromISO(contact.lastUpdatedDateTime),
      lastUpdatedBy: `${contact.lastUpdatedByUser.forenames} ${contact.lastUpdatedByUser.surname}`,
      from: (meta as CommunicationMetaResult).value?.from?.replace('{}', offenderName),
      to: (meta as CommunicationMetaResult).value?.to?.replace('{}', offenderName),
    }
  }

  private static getActivityLogEntryBase(
    contact: ContactSummary,
  ): Pick<ActivityLogEntryBase, 'id' | 'start' | 'notes' | 'sensitive'> {
    return {
      id: contact.contactId,
      start: DateTime.fromISO(contact.contactStart),
      notes: contact.notes,
      sensitive: contact.sensitive || false,
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
