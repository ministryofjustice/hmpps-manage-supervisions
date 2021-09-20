import { DateTime } from 'luxon'
import { PotentiallyExpectedDateTime } from '../../util'
import { ViewModel } from '../../common'
import { ComplianceConvictionSummary } from '../compliance'

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

export interface PreviousConvictionSummary {
  name: string
  mainOffence: string
  endDate: DateTime
}

export interface PreviousConvictionsViewModel extends ViewModel {
  displayName: string
  previousConvictions: PreviousConvictionSummary[]
  links: {
    toDelius: string
  }
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
  requirement: string
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
