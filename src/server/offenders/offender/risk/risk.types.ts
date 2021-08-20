import { DateTime } from 'luxon'
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
  active: RegistrationFlag[]
  inactive: RegistrationFlag[]
}

export interface RegistrationFlag {
  text: string
  notes?: string
  reviewDue?: DateTime
  link: string
}

export interface FlatRiskToSelf {
  value: string
  notes: { current?: string; previous?: string }
}

export interface RemovedRisksListViewModel {}

export interface RiskDetailsViewModel {}

export interface RiskRegistrationDetails {
  riskDescription: string
  notes: string
  reviewDue?: DateTime
  reviewed?: DateTime
  reviewedBy: string
  added: DateTime
  addedBy: string
  removed?: DateTime
  removedBy?: string
  removedNotes?: string
  typeInfo: {
    purpose: string
    suggestedReviewFrequency: string
    termination: string
    furtherInformation: string
  }
}
