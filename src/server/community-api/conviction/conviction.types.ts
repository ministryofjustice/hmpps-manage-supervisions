import { PotentiallyExpectedDateTime } from '../../util'
import { SentenceRequirementsAndBreachApiGetRequirementsByConvictionIdUsingGETRequest } from '../client'

export type GetConvictionRequirementsOptions =
  SentenceRequirementsAndBreachApiGetRequirementsByConvictionIdUsingGETRequest

export interface ConvictionRequirementDetail {
  id: number
  length: string
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
