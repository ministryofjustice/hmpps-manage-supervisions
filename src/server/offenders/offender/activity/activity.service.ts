import { Injectable } from '@nestjs/common'
import {
  AppointmentDetail,
  AppointmentOutcome,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
} from '../../../community-api/client'
import {
  CommunityApiService,
  Paginated,
  GetMetaResult,
  isAppointment,
  ContactMappingService,
} from '../../../community-api'
import {
  ActivityLogEntry,
  ActivityLogEntryBase,
  ActivityLogEntryTag,
  AppointmentActivityLogEntry,
} from './activity.types'
import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../../config'
import { BreadcrumbType, LinksService } from '../../../common/links'

export type GetContactsOptions = Omit<
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  'crn' | 'from' | 'to'
>

function getOutcomeFlags(outcome?: AppointmentOutcome): ActivityLogEntryTag[] {
  switch (outcome?.complied) {
    case true:
      return [{ name: outcome.attended ? 'complied' : 'acceptable absence', colour: 'green' }]
    case false:
      return [{ name: outcome.attended ? 'failed to comply' : 'unacceptable absence', colour: 'red' }]
    default:
      return []
  }
}

function getAppointmentFlags(contact: ContactSummary | AppointmentDetail): ActivityLogEntryTag[] {
  const tags = []
  if (contact.sensitive) {
    tags.push({ name: 'sensitive', colour: 'grey' })
  }

  if (contact.rarActivity) {
    tags.push({ name: 'rar', colour: 'purple' })
  }

  return tags
}

@Injectable()
export class ActivityService {
  constructor(
    private readonly community: CommunityApiService,
    private readonly contacts: ContactMappingService,
    private readonly links: LinksService,
  ) {}

  async getActivityLogPage(crn: string, options: GetContactsOptions = {}): Promise<Paginated<ActivityLogEntry>> {
    const { data } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET({
      crn,
      to: DateTime.now().toUTC().toISO(), // this endpoint does not accept offset date times.
      ...options,
    })

    return {
      totalPages: data.totalPages,
      first: data.first,
      last: data.last,
      number: data.number,
      size: data.size,
      totalElements: data.totalElements,
      content: await Promise.all(data.content.map(contact => this.getActivityLogEntry(crn, contact))),
    }
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

  private async getActivityLogEntry(crn: string, contact: ContactSummary): Promise<ActivityLogEntry> {
    const meta = await this.contacts.getTypeMeta(contact)

    if (isAppointment(meta)) {
      // is either a well-known or 'other' appointment
      return this.getAppointmentActivityLogEntry(crn, contact, meta)
    }

    const base = {
      id: contact.contactId,
      start: DateTime.fromISO(contact.contactStart),
      notes: contact.notes,
      sensitive: contact.sensitive || false,
    } as Pick<ActivityLogEntryBase, 'id' | 'start' | 'notes' | 'sensitive'>

    if (meta.type === ContactTypeCategory.Communication) {
      // is a communication type (either known, or in the CAPI Communication category)
      return {
        ...base,
        type: meta.type,
        category: 'Other communication',
        name: meta.name,
        typeName: meta.value.name,
        tags: [],
        links: {
          view: `/offender/${crn}/communication/${contact.contactId}`,
          addNotes: `/offender/${crn}/communication/${contact.contactId}/add-notes`,
        },
      }
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
        view: this.links.getUrl(BreadcrumbType.Appointment, { id, crn }),
        addNotes: `/offender/${crn}/appointment/${id}/add-notes`,
        recordMissingAttendance: missingOutcome ? `/offender/${crn}/appointment/${id}/record-outcome` : null,
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
}
