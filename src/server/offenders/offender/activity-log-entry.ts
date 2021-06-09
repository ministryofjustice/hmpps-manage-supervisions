import { DateTime } from 'luxon'
import { WellKnownContactTypeCategory } from '../../config'

export interface ActivityLogEntryLinks {
  view: string
  addNotes: string
}

export interface ActivityLogEntryTag {
  name: string
  colour: 'red' | 'green'
}

export interface ActivityLogEntryBase<Links extends ActivityLogEntryLinks = ActivityLogEntryLinks> {
  type: WellKnownContactTypeCategory
  id: number
  start: DateTime
  name: string
  notes?: string
  tags: ActivityLogEntryTag[]
  links: Links
}

export interface AppointmentActivityLogEntry
  extends ActivityLogEntryBase<ActivityLogEntryLinks & { recordMissingAttendance: string | null }> {
  type: WellKnownContactTypeCategory.Appointment
  end: DateTime
}

export interface CommunicationActivityLogEntry extends ActivityLogEntryBase {
  type: WellKnownContactTypeCategory.Communication
}

export interface UnknownActivityLogEntry extends ActivityLogEntryBase<null> {
  type: null
}

export type ActivityLogEntry = AppointmentActivityLogEntry | CommunicationActivityLogEntry | UnknownActivityLogEntry
