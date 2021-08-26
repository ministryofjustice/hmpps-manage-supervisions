import { DateTime } from 'luxon'
import { BreadcrumbValue } from '../../../../server/common'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

export interface Risks {
  community: {
    level?: RiskLevelMeta
    risks: RoshRisk[]
    riskLevels: Partial<Record<RiskLevel, string[]>>
    whoIsAtRisk?: string
    natureOfRisk?: string
    riskImminence?: string
  }
  self: {
    harm: FlatRiskToSelf
    custody: FlatRiskToSelf
    vulnerability: FlatRiskToSelf
  }
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
  link: string
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

export interface RiskViewModel {
  displayName: string
  breadcrumbs: BreadcrumbValue[]
}

export interface RiskRegistrationDetails extends RiskRegistration {
  reviewed?: DateTime
  reviewedBy?: string
  added: DateTime
  addedBy: string
  removedBy?: string
  removedNotes?: string
  typeInfo?: RiskTypeInformation
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
