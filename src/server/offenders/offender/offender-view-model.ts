import { ActivityFilter, ActivityLogEntry } from './activity'
import { ComplianceDetails, ConvictionDetails } from './sentence'
import { AppointmentSummary, RecentAppointments } from './schedule'
import { RiskRegistrations, Risks } from './risk'
import { GetPersonalDetailsResult } from './personal'
import { ViewModel } from '../../common'

export enum OffenderPage {
  Overview = 'overview',
  Schedule = 'schedule',
  Activity = 'activity',
  Personal = 'personal',
  Sentence = 'sentence',
  Compliance = 'compliance',
  Risk = 'risk',
}

export type OffenderPageLinks = { [Page in OffenderPage]: string }

export interface OffenderLinks extends OffenderPageLinks {
  arrangeAppointment: string
  addActivity: string
  addressBook: string
  circumstances: string
  disabilities: string
  toDelius: string
  toOASys: string
  viewInactiveRegistrations: string
}

export interface OffenderViewModelBase extends ViewModel {
  page: OffenderPage
  ids: {
    crn: string
    pnc?: string
  }
  displayName: string
  links: OffenderLinks
  registrations: RiskRegistrations
}

export interface OffenderOverviewViewModel extends OffenderViewModelBase, GetPersonalDetailsResult {
  page: OffenderPage.Overview
  conviction?: ConvictionDetails & { rar?: string }
  appointmentSummary: AppointmentSummary
  risks: Risks
}

export interface OffenderScheduleViewModel extends OffenderViewModelBase {
  page: OffenderPage.Schedule
  appointments: RecentAppointments
  appointmentBookingEnabled: boolean
}

export interface OffenderActivityViewModel extends OffenderViewModelBase {
  page: OffenderPage.Activity
  contacts: ActivityLogEntry[]
  pagination: {
    page?: number
    size?: number
  }
  filters: {}
  currentFilter?: ActivityFilter
  title: string
}

export interface OffenderPersonalViewModel extends OffenderViewModelBase, GetPersonalDetailsResult {
  page: OffenderPage.Personal
}

export interface OffenderSentenceViewModel extends OffenderViewModelBase {
  page: OffenderPage.Sentence
  conviction?: ConvictionDetails
}

export interface OffenderComplianceViewModel extends OffenderViewModelBase {
  page: OffenderPage.Compliance
  compliance: ComplianceDetails
}

export interface OffenderRiskViewModel extends OffenderViewModelBase {
  page: OffenderPage.Risk
  risks: Risks
}

export type OffenderViewModel =
  | OffenderOverviewViewModel
  | OffenderScheduleViewModel
  | OffenderActivityViewModel
  | OffenderPersonalViewModel
  | OffenderSentenceViewModel
  | OffenderComplianceViewModel
  | OffenderRiskViewModel
