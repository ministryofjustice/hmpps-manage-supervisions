import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../../config'
import { ViewModel } from '../../../common'
import { AppointmentRequirementDetail } from '../../../community-api'

export interface ActivityLogEntryLinks {
  view: string
  addNotes: string
}

export interface ActivityLogEntryTag {
  name: string
  colour: 'red' | 'green' | 'purple' | 'grey'
}

export interface ActivityLogEntryBase<Links extends ActivityLogEntryLinks = ActivityLogEntryLinks> {
  type: ContactTypeCategory
  id: number
  start: DateTime
  name: string
  category: string
  typeName: string
  notes?: string
  tags: ActivityLogEntryTag[]
  links: Links
  sensitive: boolean
}

export interface AppointmentActivityLogEntry
  extends ActivityLogEntryBase<ActivityLogEntryLinks & { recordMissingAttendance: string | null }> {
  type: ContactTypeCategory.Appointment
  end?: DateTime
  rarActivity: boolean
  requirement?: AppointmentRequirementDetail
  outcome?: {
    complied: boolean
    attended: boolean
    description: string
  }
}

export interface CommunicationActivityLogEntry extends ActivityLogEntryBase {
  type: ContactTypeCategory.Communication
}

export interface UnknownActivityLogEntry extends ActivityLogEntryBase<null> {
  type: ContactTypeCategory.Other
}

export type ActivityLogEntry = AppointmentActivityLogEntry | CommunicationActivityLogEntry | UnknownActivityLogEntry

export interface AppointmentViewModel extends ViewModel {
  displayName: string
  appointment: AppointmentActivityLogEntry
}
