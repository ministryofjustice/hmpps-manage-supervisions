import { DateTime } from 'luxon'
import { ViewModel } from '../../common'
import { GovUkUiTagColour } from '../../util/govuk-ui'

export enum AssessRisksAndNeedsApiStatus {
  Available = 'available',
  Unavailable = 'unavailable',
  NoRiskAssessment = 'missing',
}

export interface RisksAndNeedsResult<ServiceStatus extends AssessRisksAndNeedsApiStatus> {
  status: ServiceStatus
}

export type RisksAndNeedsServiceUnavailable = RisksAndNeedsResult<AssessRisksAndNeedsApiStatus.Unavailable>

export type RisksAndNeedsAssessmentNotFound = RisksAndNeedsResult<AssessRisksAndNeedsApiStatus.NoRiskAssessment>

export type RisksAndNeedsDegraded = RisksAndNeedsServiceUnavailable | RisksAndNeedsAssessmentNotFound

export interface Risks extends RisksAndNeedsResult<AssessRisksAndNeedsApiStatus.Available> {
  community: {
    level?: RiskLevelMeta
    risks: RoshRisk[]
    riskLevels: Partial<Record<RiskLevel, string[]>>
    whoIsAtRisk?: string
    natureOfRisk?: string
    riskImminence?: string
  }
  self: {
    current: boolean
    previous: boolean
    harm: FlatRiskToSelf
    custody: FlatRiskToSelf
    vulnerability: FlatRiskToSelf
  }
  assessedOn: DateTime
}

export enum RiskLevel {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  VeryHigh = 'VERY_HIGH',
}

export interface RoshRisk {
  riskTo: string
  meta: RiskLevelMeta
  level: RiskLevel
}

export interface RiskLevelMeta {
  colour: GovUkUiTagColour
  text: string
  index: number
}

export interface RiskRegistrations {
  active: RiskRegistration[]
  inactive: RiskRegistration[]
}

export interface RiskRegistration {
  text: string
  notes?: string
  reviewDue?: DateTime
  removed?: DateTime
  links: {
    view: string
  }
}

export interface FlatRiskToSelf {
  value: string
  notes: { current?: string; previous?: string }
}

export interface RemovedRisksListViewModel extends RiskViewModel {
  removedRisks: RiskRegistration[]
}

export interface RiskDetailsViewModel extends RiskViewModel {
  registration: RiskRegistrationDetails
}

export interface RiskViewModel extends ViewModel {
  displayName: string
}

export interface RiskRegistrationDetails extends RiskRegistration {
  reviewed?: DateTime
  reviewedBy?: string
  added: DateTime
  addedBy: string
  removedBy?: string
  removedNotes?: string
  typeInfo?: RiskTypeInformation
  links: {
    view: string
    delete: string
    updateNotes: string
    viewLastReview: string
    addReview: string
  }
}

export interface RiskTypeInformation {
  description: string
  purpose: string
  suggestedReviewFrequency: number
  termination: string
  furtherInformation: string
}

export interface RiskReferenceData {
  [key: string]: RiskTypeInformation
}

export interface CriminogenicNeed {
  date: DateTime
  name: string
}

export interface CriminogenicNeeds extends RisksAndNeedsResult<AssessRisksAndNeedsApiStatus.Available> {
  needs: CriminogenicNeed[]
}
