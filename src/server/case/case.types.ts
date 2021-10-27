import { ActivityComplianceFilter, CaseActivityLogGroup } from './activity'
import { ComplianceDetails, ConvictionDetails } from './sentence'
import { AppointmentListViewModel, NextAppointmentSummary } from './schedule'
import { AssessRisksAndNeedsApiStatus, RiskRegistrations, Risks, RisksAndNeedsDegraded } from './risk'
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

export interface CaseViewModelBase<Page extends CasePage, Links> extends ViewModel {
  page: Page
  assessRisksAndNeedsApiStatus?: AssessRisksAndNeedsApiStatus
  ids: {
    crn: string
    pnc?: string
  }
  displayName: string
  shortName: string
  links: CasePageLinks & Links
}

export interface CaseOverviewViewModel extends CaseViewModelBase<CasePage.Overview, {}>, GetPersonalDetailsResult {
  compliance: ComplianceDetails
  nextAppointment?: NextAppointmentSummary
  risks: Risks | RisksAndNeedsDegraded
  registrations: RiskRegistrations
}

export interface CaseScheduleLinks {
  arrangeAppointment: string
}

export interface CaseScheduleViewModel extends CaseViewModelBase<CasePage.Schedule, CaseScheduleLinks> {
  appointments: AppointmentListViewModel[]
  appointmentBookingEnabled: boolean
}

export interface CaseActivityLinks {
  addActivity: string
}

export interface CaseActivityViewModel extends CaseViewModelBase<CasePage.Activity, CaseActivityLinks> {
  groups: CaseActivityLogGroup[]
  pagination: {
    page?: number
    size?: number
  }
  filters: {}
  currentFilter?: ActivityComplianceFilter
  title?: string
}

export interface CasePersonalLinks {
  addressBook: string
  circumstances: string
  disabilities: string
  criminogenicNeeds: string
  viewEquality: string
}

export interface CasePersonalViewModel
  extends CaseViewModelBase<CasePage.Personal, CasePersonalLinks>,
    GetPersonalDetailsResult {}

export interface CaseSentenceLinks {
  previousConvictions: string
  additionalOffences: string
}

export interface CaseSentenceViewModel extends CaseViewModelBase<CasePage.Sentence, CaseSentenceLinks> {
  conviction?: ConvictionDetails
}

export interface CaseComplianceLinks {
  startBreach: string
  multipleBreachDetail: string
  viewAllOrders: string
}

export interface CaseComplianceViewModel extends CaseViewModelBase<CasePage.Compliance, CaseComplianceLinks> {
  compliance: ComplianceDetails
}

export interface CaseRiskLinks {
  viewInactiveRegistrations: string
  roshCommunity: string
  roshSelf: string
  noAssessment: string
  addRiskFlag: string
}

export interface CaseRiskViewModel extends CaseViewModelBase<CasePage.Risk, CaseRiskLinks> {
  risks: Risks | RisksAndNeedsDegraded
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
