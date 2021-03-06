import { DateTime } from 'luxon'
import { ContactTypeCategory } from '../../config'
import { ViewModel } from '../../common'
import { GovUkUiTagColour } from '../../util/govuk-ui'
import { ConvictionSummary } from '../sentence'

export interface GetActivityLogOptions {
  conviction: ConvictionSummary
  complianceFilter?: ActivityComplianceFilter
}

export interface ActivityLogEntryLinks {
  view: string
  addNotes: string
}

export interface ActivityLogEntryTag {
  name: string
  colour: GovUkUiTagColour
}
export interface AppointmentsMissingOutcome {
  count: number
  activityFilterLink: string
}
interface ActivityLogEntryBase<Type extends ContactTypeCategory, Links = {}> {
  type: Type
  id: number
  start: DateTime
  name: string
  category: string
  isFuture: boolean
  /**
   * Well known entry name if available
   */
  typeName?: string
  notes?: string
  links: ActivityLogEntryLinks & Links
  sensitive: boolean
}

export interface AppointmentActivityLogEntry
  extends ActivityLogEntryBase<
    ContactTypeCategory.Appointment,
    { recordMissingAttendance: string | null; updateOutcome: string; updateEnforcement?: string }
  > {
  nationalStandard: boolean
  enforcementAction?: string
  end?: DateTime
  location?: string
  rarActivity: { name?: string }
  outcome?: {
    complied: boolean
    attended: boolean
    description: string
    tag: ActivityLogEntryTag
    compliedAndAttendedText: string
  }
}

export interface CommunicationActivityLogEntry extends ActivityLogEntryBase<ContactTypeCategory.Communication> {
  lastUpdatedDateTime: DateTime
  lastUpdatedBy: string
  from?: string
  to?: string
}

export interface UnknownActivityLogEntry extends ActivityLogEntryBase<ContactTypeCategory.Other> {
  lastUpdatedDateTime: DateTime
  lastUpdatedBy: string
}
export type SystemActivityLogEntry = ActivityLogEntryBase<ContactTypeCategory.System>

export type CaseActivityLogEntry =
  | AppointmentActivityLogEntry
  | CommunicationActivityLogEntry
  | UnknownActivityLogEntry
  | SystemActivityLogEntry

export interface CaseActivityLogGroup {
  date: DateTime
  isToday: boolean
  entries: CaseActivityLogEntry[]
}

export interface AppointmentViewModel extends ViewModel {
  displayName: string
  appointment: AppointmentActivityLogEntry
}

export interface CommunicationViewModel extends ViewModel {
  displayName: string
  contact: CommunicationActivityLogEntry
}

export interface OtherActivityLogEntryViewModel extends ViewModel {
  displayName: string
  contact: UnknownActivityLogEntry
}

export enum ActivityComplianceFilter {
  Appointments = 'appointments',
  WithoutOutcome = 'without-an-outcome',
  CompliedAppointments = 'complied-appointments',
  FailedToComplyAppointments = 'failed-to-comply-appointments',
  AcceptableAbsenceAppointments = 'acceptable-absence-appointments',
  WarningLetters = 'warning-letters',
  RarActivity = 'rar-activity',
}

export const FilterLinks: { [key: string]: ActivityFilterMeta } = {
  [ActivityComplianceFilter.Appointments]: { name: 'Appointments', description: 'National Standard appointments' },
  [ActivityComplianceFilter.WithoutOutcome]: {
    name: 'Without an outcome',
    description: 'National Standard appointments without an outcome',
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
  [ActivityComplianceFilter.RarActivity]: {
    name: 'RAR activity',
    description: 'Appointments with an associated RAR requirement',
  },
}

export interface ActivityFilterMeta {
  name: string
  description: string
}
