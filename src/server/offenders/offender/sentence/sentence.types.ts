import { DateTime } from 'luxon'
import { PotentiallyExpectedDateTime } from '../../../util'

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
  notes: string
}

export interface ConvictionDetails {
  previousConvictions?: PreviousConvictions
  offence?: ConvictionOffence
  sentence?: ConvictionSentenceDetail
  requirements: ConvictionRequirement[]
}
