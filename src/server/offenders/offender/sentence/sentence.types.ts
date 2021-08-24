import { DateTime } from 'luxon'
import { PotentiallyExpectedDateTime } from '../../../util'
import { BreachSummary } from '../../../community-api/breach'

export interface ConvictionOffence {
  id: string
  description: string
  category: string
  date: DateTime
  additionalOffences: string[]
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

export interface GetConvictionRequirementsOptions {
  crn: string
  convictionId: number
}

export interface ConvictionRequirementDetail {
  length: string
  progress?: string
  notes?: string
  startDate?: PotentiallyExpectedDateTime
  endDate?: PotentiallyExpectedDateTime
  terminationReason?: string
}

export enum ConvictionRequirementType {
  Unit = 'unit',
  Aggregate = 'aggregate',
}

export interface ConvictionRequirementBase<Type extends ConvictionRequirementType> {
  type: Type
  name: string
  isRar: boolean
}

export interface UnitConvictionRequirement
  extends ConvictionRequirementBase<ConvictionRequirementType.Unit>,
    ConvictionRequirementDetail {}

export interface AggregateConvictionRequirement extends ConvictionRequirementBase<ConvictionRequirementType.Aggregate> {
  requirements: ConvictionRequirementDetail[]
}

export type ConvictionRequirement = UnitConvictionRequirement | AggregateConvictionRequirement

export interface PreviousConvictions {
  count: number
  lastEnded: DateTime
  link: string
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

export interface ConvictionDetails {
  previousConvictions?: PreviousConvictions
  previousBreaches?: PreviousBreaches
  offence?: ConvictionOffence
  sentence?: ConvictionSentenceDetail
  requirements: ConvictionRequirement[]
}

export interface ComplianceActiveBreachSummary extends BreachSummary {
  active: true
  additionalActiveBreaches: number
}

export interface ComplianceConvictionSummary {
  name: string
  progress?: string
  mainOffence: string
  startDate: DateTime
  endDate?: DateTime
  terminationReason?: string
  length: string
  inBreach: boolean
  activeBreach?: ComplianceActiveBreachSummary
  previousBreaches: BreachSummary[]
  allBreaches: BreachSummary[]
  lastRecentBreachEnd?: DateTime
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
  requirement: string
  period: CompliancePeriod
  appointments: {
    total: ComplianceQuantity
    complied: ComplianceQuantity
    acceptableAbsences: ComplianceQuantity
    failureToComply: ComplianceQuantity
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
