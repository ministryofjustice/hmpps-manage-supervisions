import { ActivityComplianceFilter, ActivityLogEntry } from './activity'
import { ComplianceDetails, ConvictionDetails } from './sentence'
import { NextAppointmentSummary, RecentAppointments } from './schedule'
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
  previousConvictions: string
  startBreach: string
}

export interface OffenderViewModelBase<Page extends OffenderPage> extends ViewModel {
  page: Page
  ids: {
    crn: string
    pnc?: string
  }
  displayName: string
  shortName: string
  links: OffenderLinks
}

export interface OffenderOverviewViewModel
  extends OffenderViewModelBase<OffenderPage.Overview>,
    GetPersonalDetailsResult {
  compliance: ComplianceDetails
  nextAppointment?: NextAppointmentSummary
  risks: Risks
  registrations: RiskRegistrations
}

export interface OffenderScheduleViewModel extends OffenderViewModelBase<OffenderPage.Schedule> {
  appointments: RecentAppointments
  appointmentBookingEnabled: boolean
}

export interface OffenderActivityViewModel extends OffenderViewModelBase<OffenderPage.Activity> {
  contacts: ActivityLogEntry[]
  pagination: {
    page?: number
    size?: number
  }
  filters: {}
  currentFilter?: ActivityComplianceFilter
  title: string
}

export interface OffenderPersonalViewModel
  extends OffenderViewModelBase<OffenderPage.Personal>,
    GetPersonalDetailsResult {}

export interface OffenderSentenceViewModel extends OffenderViewModelBase<OffenderPage.Sentence> {
  conviction?: ConvictionDetails
}

export interface OffenderComplianceViewModel extends OffenderViewModelBase<OffenderPage.Compliance> {
  compliance: ComplianceDetails
}

export interface OffenderRiskViewModel extends OffenderViewModelBase<OffenderPage.Risk> {
  risks: Risks
  registrations: RiskRegistrations
}

export type OffenderViewModel =
  | OffenderOverviewViewModel
  | OffenderScheduleViewModel
  | OffenderActivityViewModel
  | OffenderPersonalViewModel
  | OffenderSentenceViewModel
  | OffenderComplianceViewModel
  | OffenderRiskViewModel
