import { Injectable } from '@nestjs/common'
import { sortBy } from 'lodash'
import { DateTime } from 'luxon'
import {
  AppointmentOutcome,
  CommunityApiService,
  ContactAndAttendanceApiGetOffenderContactSummariesByCrnUsingGETRequest,
  ContactSummary,
  OffenderDetail,
  Paginated,
} from '../../community-api'
import { AppointmentListViewModel, RecentAppointments } from './offender-view-model'
import { ContactMappingService, isAppointment } from '../../common'
import { ActivityLogEntry, ActivityLogEntryBase, ActivityLogEntryTag } from './activity-log-entry'
import { WellKnownContactTypeCategory } from '../../config'

export const MAX_RECENT_APPOINTMENTS = 20

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
export class OffenderService {
  constructor(private readonly community: CommunityApiService, private readonly contacts: ContactMappingService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getRecentAppointments(crn: string): Promise<RecentAppointments> {
    const { data } = await this.community.appointment.getOffenderAppointmentsByCrnUsingGET({ crn })
    const now = DateTime.now()
    const result: RecentAppointments = data.reduce(
      (agg, apt) => {
        const collection =
          DateTime.fromISO(apt.appointmentStart) > now
            ? agg.future
            : agg.recent.length < MAX_RECENT_APPOINTMENTS
            ? agg.recent
            : agg.past
        const view: AppointmentListViewModel = {
          ...apt,
          name: this.contacts.getTypeMeta(apt).name,
          link: `/offender/${crn}/appointment/${apt.appointmentId}`,
        }
        collection.push(view)
        return agg
      },
      { future: [], recent: [], past: [] },
    )

    result.future = sortBy(
      result.future,
      x => x.appointmentStart,
      x => x.appointmentEnd,
    )

    return result
  }

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
