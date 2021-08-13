import { DateTime } from 'luxon'

export interface GetBreachesOptions {
  /**
   * Attempt to get the breach outcome.
   * Default: true
   * Note: this has a performance cost so disable if not required.
   */
  includeOutcome?: boolean
}

export interface BreachSummary {
  active: boolean
  startDate: DateTime
  endDate?: DateTime
  status?: string
  outcome?: string
  proven: boolean
}

export interface GetBreachesResult {
  breaches: BreachSummary[]

  /**
   * The most recent end date of any breach that ended within the last 12 months.
   */
  lastRecentBreachEnd: DateTime | null
}
