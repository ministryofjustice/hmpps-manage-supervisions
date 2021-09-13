import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../../config'
import { ViewModel } from '../../../common'
import { AppointmentRequirementDetail } from '../../../community-api/client'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

export interface ActivityLogEntryLinks {
  view: string
  addNotes: string
}

export interface ActivityLogEntryTag {
  name: string
  colour: GovUkUiTagColour
}

export interface ActivityLogEntryBase<Links extends ActivityLogEntryLinks = ActivityLogEntryLinks> {
  type: ContactTypeCategory
  id: number
  start: DateTime
  name: string
  category: string
  isFuture: boolean
  typeName: string
  notes?: string
  tags: ActivityLogEntryTag[]
  links: Links
  sensitive: boolean
}

export interface AppointmentActivityLogEntry
  extends ActivityLogEntryBase<
    ActivityLogEntryLinks & { recordMissingAttendance: string | null } & { toDelius: string }
  > {
  type: ContactTypeCategory.Appointment
  nationalStandard: boolean
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
  lastUpdatedDateTime: DateTime
  lastUpdatedBy: string
  from?: string
  to?: string
}

export interface UnknownActivityLogEntry extends ActivityLogEntryBase<null> {
  type: ContactTypeCategory.Other
}

export type ActivityLogEntry = AppointmentActivityLogEntry | CommunicationActivityLogEntry | UnknownActivityLogEntry

export interface AppointmentViewModel extends ViewModel {
  displayName: string
  appointment: AppointmentActivityLogEntry
}
export interface CommunicationViewModel extends ViewModel {
  displayName: string
  contact: CommunicationActivityLogEntry
}

export enum ActivityComplianceFilter {
  Appointments = 'appointments',
  WithoutOutcome = 'without-an-outcome',
  CompliedAppointments = 'complied-appointments',
  FailedToComplyAppointments = 'failed-to-comply-appointments',
  AcceptableAbsenceAppointments = 'acceptable-absence-appointments',
  WarningLetters = 'warning-letters',
}

export const FilterLinks: { [key: string]: ActivityFilterMeta } = {
  [ActivityComplianceFilter.Appointments]: { name: 'Appointments', description: 'Appointments' },
  [ActivityComplianceFilter.WithoutOutcome]: {
    name: 'Without an outcome',
    description: 'Appointments without an outcome',
  },
  [ActivityComplianceFilter.CompliedAppointments]: { name: 'Complied', description: 'Complied appointments' },
  [ActivityComplianceFilter.FailedToComplyAppointments]: {
    name: 'Failures to comply',
    description: 'Failures to comply within 12 months',
  },
  [ActivityComplianceFilter.AcceptableAbsenceAppointments]: {
    name: 'Acceptable absences',
    description: 'Acceptable abscences',
  },
  [ActivityComplianceFilter.WarningLetters]: { name: 'Warning letters', description: 'Warning letters' },
}

export interface ActivityFilterMeta {
  name: string
  description: string
}
