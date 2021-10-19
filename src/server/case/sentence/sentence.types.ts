import { DateTime } from 'luxon'
import { ViewModel } from '../../common'
import { ComplianceConvictionSummary } from '../compliance'
import { ConvictionRequirement } from '../../community-api'

export interface ConvictionAdditionalOffence {
  name: string
  code: string
  category: string
  date: DateTime
}

export interface ConvictionOffence {
  id: string
  description: string
  category: string
  date: DateTime
  code: string
  additionalOffences: ConvictionAdditionalOffence[]
}

export interface ConvictionSentenceDetail {
  description: string
  convictionDate: DateTime
  startDate: DateTime
  endDate: DateTime
  elapsed: string
  courtAppearance?: string
  responsibleCourt?: string
  additionalSentences: AdditionalSentence[]
}

export interface PreviousConvictionSummary {
  name: string
  mainOffence: string
  endDate: DateTime
  link: string
}

export interface PreviousConvictionsViewModel extends ViewModel {
  displayName: string
  previousConvictions: PreviousConvictionSummary[]
}

export interface PreviousConvictions {
  count: number
  lastEnded: DateTime
}

export interface AdditionalSentence {
  name: string
  length?: number
  value?: number
  notes?: string
}

export interface PreviousBreaches {
  count: number
}

export interface ConvictionSummary {
  id: number
  sentence?: ConvictionSentenceDetail
}

export interface ConvictionDetails {
  previousConvictions?: PreviousConvictions
  previousBreaches?: PreviousBreaches
  offence?: ConvictionOffence
  sentence?: ConvictionSentenceDetail
  requirements: ConvictionRequirement[]
}

export enum ComplianceStatus {
  Clean = 'clean',
  FailureToComply = 'failure-to-comply',
  InBreach = 'in-breach',
  PendingBreach = 'pending-breach',
  PreviousBreach = 'previous-breach',
}

/**
 * Alert levels that map to colours of the `app-card--#{colour}` classes.
 */
export enum ComplianceStatusAlertLevel {
  Danger = 'red',
  Warning = 'grey',
  Success = 'green',
}

export interface ComplianceQuantity {
  name: string
  value: number
  link?: string
}

export enum CompliancePeriod {
  Last12Months = 'within 12 months',
  SinceLastBreach = 'since last breach',
}
export interface CurrentComplianceConvictionSummary extends ComplianceConvictionSummary {
  requirement?: {
    name: string
    totalRarCount: number
    requirementCount: number
  }
  period: CompliancePeriod
  appointments: {
    total: ComplianceQuantity
    complied: ComplianceQuantity
    acceptableAbsences: ComplianceQuantity
    failureToComply: ComplianceQuantity
    withoutAnOutcome: ComplianceQuantity
  }
  status: {
    value: ComplianceStatus
    alertLevel: ComplianceStatusAlertLevel
    description: string
    breachSuggested: boolean
  }
}

export interface ComplianceDetails {
  current?: CurrentComplianceConvictionSummary
  previous: {
    convictions: ComplianceConvictionSummary[]
    dateFrom: DateTime
    totalBreaches: number
  }
}

export interface OffencesViewModel extends ViewModel {
  displayName: string
  offence: ConvictionOffence
}
