import { DateTime } from 'luxon'
import { WellKnownContactTypeCategory } from '../../../config'
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
  type: WellKnownContactTypeCategory
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
  type: WellKnownContactTypeCategory.Appointment
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
  type: WellKnownContactTypeCategory.Communication
}

export interface UnknownActivityLogEntry extends ActivityLogEntryBase<null> {
  type: null
}

export type ActivityLogEntry = AppointmentActivityLogEntry | CommunicationActivityLogEntry | UnknownActivityLogEntry

export interface AppointmentViewModel extends ViewModel {
  displayName: string
  appointment: AppointmentActivityLogEntry
}
