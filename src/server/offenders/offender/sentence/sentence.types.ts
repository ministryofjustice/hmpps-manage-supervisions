import { DateTime } from 'luxon'

export interface ConvictionOffence {
  id: string
  description: string
  date: DateTime
}

export interface ConvictionSentenceDetail {
  description: string
  length: string
  convictionDate: DateTime
  startDate: DateTime
  endDate: DateTime
  elapsed: string
  courtAppearance?: string
  responsibleCourt?: string
}

export interface ConvictionRequirementDetail {
  length: string
  progress: string
}

export interface PreviousConvictions {
  count: number
  lastEnded: DateTime
  link: string
}

export interface ConvictionDetails {
  previousConvictions?: PreviousConvictions
  mainOffence?: ConvictionOffence
  additionalOffences: ConvictionOffence[]
  sentence?: ConvictionSentenceDetail
  requirement?: ConvictionRequirementDetail
}
