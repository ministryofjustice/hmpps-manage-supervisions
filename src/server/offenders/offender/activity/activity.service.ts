import { Injectable } from '@nestjs/common'
import {
  AppointmentOutcome,
  CommunityApiService,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
  Paginated,
} from '../../../community-api'
import { ActivityLogEntry, ActivityLogEntryBase, ActivityLogEntryTag } from './activity.types'
import { ContactMappingService, isAppointment } from '../../../common'
import { DateTime } from 'luxon'
import { WellKnownContactTypeCategory } from '../../../config'

export type GetContactsOptions = Omit<ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest, 'crn'>

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

function getAppointmentFlags(contact: ContactSummary): ActivityLogEntryTag[] {
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
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getActivityLogPage(crn: string, options: GetContactsOptions = {}): Promise<Paginated<ActivityLogEntry>> {
    const { data } = await this.community.contactAndAttendance.getOffenderContactSummariesByCrnUsingGET({
      crn,
      ...options,
    })

    return {
      totalPages: data.totalPages,
      first: data.first,
      last: data.last,
      number: data.number,
      size: data.size,
      totalElements: data.totalElements,
      content: data.content.map(contact => this.getActivityLogEntry(crn, contact)),
    }
  }

  private getActivityLogEntry(crn: string, contact: ContactSummary): ActivityLogEntry {
    const start = DateTime.fromISO(contact.contactStart)
    const base = {
      id: contact.contactId,
      start,
      notes: contact.notes,
    } as ActivityLogEntryBase

    const meta = this.contacts.getTypeMeta(contact)

    if (isAppointment(meta)) {
      // is either a well-known or 'other' appointment
      const outcomeFlags = [...getAppointmentFlags(contact), ...getOutcomeFlags(contact.outcome)]
      const missingOutcome = outcomeFlags.length === 0 && start <= DateTime.now()
      return {
        ...base,
        type: WellKnownContactTypeCategory.Appointment,
        name: meta.name,
        end: DateTime.fromISO(contact.contactEnd),
        tags: [...outcomeFlags],
        links: {
          view: `/offender/${crn}/appointment/${contact.contactId}`,
          addNotes: `/offender/${crn}/appointment/${contact.contactId}/add-notes`,
          recordMissingAttendance: missingOutcome
            ? `/offender/${crn}/appointment/${contact.contactId}/record-outcome`
            : null,
        },
      }
    }

    if (meta.type === WellKnownContactTypeCategory.Communication) {
      // is a well known communication
      return {
        ...base,
        type: meta.type,
        name: meta.name,
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
      type: null,
      name: meta.name,
      tags: [],
      links: null,
    }
  }
}
