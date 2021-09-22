import { ActivityComplianceFilter, CaseActivityLogGroup } from './activity'
import { ComplianceDetails, ConvictionDetails } from './sentence'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule'
import { RiskRegistrations, Risks } from './risk'
import { GetPersonalDetailsResult } from './personal'
import { ViewModel } from '../common'
import { BreadcrumbType } from '../common/links'

export enum CasePage {
  Overview = 'overview',
  Schedule = 'schedule',
  Activity = 'activity',
  Personal = 'personal',
  Sentence = 'sentence',
  Compliance = 'compliance',
  Risk = 'risk',
}

export const CASE_BREADCRUMBS: Record<CasePage, BreadcrumbType> = Object.freeze({
  [CasePage.Overview]: BreadcrumbType.Case,
  [CasePage.Schedule]: BreadcrumbType.CaseSchedule,
  [CasePage.Activity]: BreadcrumbType.CaseActivityLog,
  [CasePage.Personal]: BreadcrumbType.PersonalDetails,
  [CasePage.Sentence]: BreadcrumbType.CaseSentence,
  [CasePage.Compliance]: BreadcrumbType.Compliance,
  [CasePage.Risk]: BreadcrumbType.CaseRisk,
})

export type CasePageLinks = { [Page in CasePage]: string }

export interface CaseLinks extends CasePageLinks {
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
  additionalOffences: string
}

export interface CaseViewModelBase<Page extends CasePage> extends ViewModel {
  page: Page
  ids: {
    crn: string
    pnc?: string
  }
  displayName: string
  shortName: string
  links: CaseLinks
}

export interface CaseOverviewViewModel extends CaseViewModelBase<CasePage.Overview>, GetPersonalDetailsResult {
  compliance: ComplianceDetails
  nextAppointment?: NextAppointmentSummary
  risks: Risks
  registrations: RiskRegistrations
}

export interface CaseScheduleViewModel extends CaseViewModelBase<CasePage.Schedule> {
  appointments: AppointmentListViewModel[]
  appointmentBookingEnabled: boolean
}

export interface CaseActivityViewModel extends CaseViewModelBase<CasePage.Activity> {
  groups: CaseActivityLogGroup[]
  pagination: {
    page?: number
    size?: number
  }
  filters: {}
  currentFilter?: ActivityComplianceFilter
  title: string
}

export interface CasePersonalViewModel extends CaseViewModelBase<CasePage.Personal>, GetPersonalDetailsResult {}

export interface CaseSentenceViewModel extends CaseViewModelBase<CasePage.Sentence> {
  conviction?: ConvictionDetails
}

export interface CaseComplianceViewModel extends CaseViewModelBase<CasePage.Compliance> {
  compliance: ComplianceDetails
}

export interface CaseRiskViewModel extends CaseViewModelBase<CasePage.Risk> {
  risks: Risks
  registrations: RiskRegistrations
}

export type CaseViewModel =
  | CaseOverviewViewModel
  | CaseScheduleViewModel
  | CaseActivityViewModel
  | CasePersonalViewModel
  | CaseSentenceViewModel
  | CaseComplianceViewModel
  | CaseRiskViewModel
