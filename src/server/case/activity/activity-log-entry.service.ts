import { Injectable } from '@nestjs/common'
import { ActivityLogEntry, ActivityLogGroup, ContactSummary, OffenderDetail } from '../../community-api/client'
import { AppointmentMetaResult, CommunicationMetaResult, GetMetaResult, SystemMetaResult } from '../../community-api'
import {
  CaseActivityLogEntry,
  AppointmentActivityLogEntry,
  CommunicationActivityLogEntry,
  SystemActivityLogEntry,
  UnknownActivityLogEntry,
} from './activity.types'
import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../config'
import { BreadcrumbType, LinksService } from '../../common/links'
import { GovUkUiTagColour } from '../../util/govuk-ui'
import { getDisplayName } from '../../util'

type CommonActivityLogEntry = Pick<CaseActivityLogEntry, 'id' | 'start' | 'notes' | 'sensitive' | 'isFuture'>

export type DatedActivityLogEntry = ActivityLogEntry & Pick<ActivityLogGroup, 'date'>
export type Contact = ContactSummary | DatedActivityLogEntry

function isContactSummary(value: any): value is ContactSummary {
  // this is for differentiating ContactSummary from DatedActivityLogEntry so we can be very light.
  return 'contactStart' in value
}

function getDates(value: Contact): { start: DateTime; end: DateTime } {
  if (isContactSummary(value)) {
    return { start: DateTime.fromISO(value.contactStart), end: value.contactEnd && DateTime.fromISO(value.contactEnd) }
  }
  return {
    start: DateTime.fromISO(value.startTime ? `${value.date}T${value.startTime}` : value.date),
    end: value.endTime && DateTime.fromISO(`${value.date}T${value.endTime}`),
  }
}

@Injectable()
export class ActivityLogEntryService {
  constructor(private readonly links: LinksService) {}

  getAppointmentActivityLogEntry(
    crn: string,
    contact: Contact,
    meta: AppointmentMetaResult,
  ): AppointmentActivityLogEntry {
    const { id, start, end, rarActivity } = isContactSummary(contact)
      ? {
          id: contact.contactId,
          start: DateTime.fromISO(contact.contactStart),
          end: contact.contactEnd && DateTime.fromISO(contact.contactEnd),
          rarActivity: contact.rarActivityDetail,
        }
      : {
          id: contact.contactId,
          ...getDates(contact),
          rarActivity: contact.rarActivity,
        }

    const isFuture = start > DateTime.now()
    const links = this.links.of({ id, crn })
    return {
      id,
      start,
      notes: contact.notes,
      sensitive: contact.sensitive || false,
      type: ContactTypeCategory.Appointment,
      category: `${isFuture ? 'Future' : 'Previous'} appointment`,
      isFuture,
      nationalStandard: contact.type.nationalStandard,
      name: meta.name,
      typeName: meta.value?.name || contact.type.description,
      end,
      links: {
        view: links.url(BreadcrumbType.Appointment),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
        // user is prompted to record outcome for appointments in the past without an existing outcome
        recordMissingAttendance:
          !contact.outcome && start <= DateTime.now() ? links.url(BreadcrumbType.ExitToDelius) : null,
        updateOutcome: links.url(BreadcrumbType.ExitToDelius),
      },
      rarActivity: rarActivity
        ? {
            name: [rarActivity.type?.description, rarActivity.subtype?.description].filter(x => x).join(': ') || null,
          }
        : null,
      outcome: contact.outcome
        ? {
            complied: contact.outcome.complied,
            attended: contact.outcome.attended,
            description: contact.outcome.description,
            tag: contact.outcome.complied
              ? { name: contact.outcome.attended ? 'complied' : 'acceptable absence', colour: GovUkUiTagColour.Green }
              : {
                  name: contact.outcome.attended ? 'failed to comply' : 'unacceptable absence',
                  colour: GovUkUiTagColour.Red,
                },
          }
        : null,
    }
  }

  getCommunicationActivityLogEntry(
    crn: string,
    contact: Contact,
    meta: CommunicationMetaResult,
    offender: OffenderDetail,
  ): CommunicationActivityLogEntry {
    const links = this.links.of({ id: contact.contactId, crn })
    const offenderName = getDisplayName(offender)
    return {
      ...ActivityLogEntryService.getCommonActivityLogEntryBase(contact),
      type: ContactTypeCategory.Communication,
      category: 'Other communication',
      name: meta.value?.description ? meta.value.description.replace('{}', offenderName) : meta.name,
      typeName: meta.value?.name || contact.type.description,
      links: {
        view: links.url(BreadcrumbType.Communication),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
      },
      lastUpdatedDateTime: DateTime.fromISO(contact.lastUpdatedDateTime),
      lastUpdatedBy: `${contact.lastUpdatedByUser.forenames} ${contact.lastUpdatedByUser.surname}`,
      from: meta.value?.from?.replace('{}', offenderName) || null,
      to: meta.value?.to?.replace('{}', offenderName) || null,
    }
  }

  getUnknownActivityLogEntry(crn: string, contact: Contact, meta: GetMetaResult): UnknownActivityLogEntry {
    const links = this.links.of({ id: contact.contactId, crn })
    return {
      ...ActivityLogEntryService.getCommonActivityLogEntryBase(contact),
      type: ContactTypeCategory.Other,
      category: 'Unclassified contact',
      name: meta.name,
      typeName: meta.value && 'name' in meta.value ? meta.value.name : null,
      links: {
        view: links.url(BreadcrumbType.OtherActivityLogEntry),
        addNotes: links.url(BreadcrumbType.ExitToDelius),
      },
      lastUpdatedDateTime: DateTime.fromISO(contact.lastUpdatedDateTime),
      lastUpdatedBy: `${contact.lastUpdatedByUser.forenames} ${contact.lastUpdatedByUser.surname}`,
    }
  }

  getSystemActivityLogEntry(crn: string, contact: Contact, meta: SystemMetaResult): SystemActivityLogEntry {
    const links = this.links.of({ id: contact.contactId, crn })
    return {
      ...ActivityLogEntryService.getCommonActivityLogEntryBase(contact),
      type: ContactTypeCategory.System,
      category: 'System contact',
      name: meta.name,
      links: {
        view: links.url(BreadcrumbType.ExitToDelius),
        addNotes: null,
      },
    }
  }

  private static getCommonActivityLogEntryBase(contact: Contact): CommonActivityLogEntry {
    const { start } = getDates(contact)
    return {
      id: contact.contactId,
      start,
      notes: contact.notes,
      sensitive: contact.sensitive || false,
      isFuture: start > DateTime.now(),
    }
  }
}
