import { BreachSummary } from '../../community-api/breach'
import { DateTime } from 'luxon'

export interface ComplianceActiveBreachSummary extends BreachSummary {
  active: true
  additionalActiveBreaches: number
}

export interface ComplianceConvictionSummary {
  id: number
  link: string
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
