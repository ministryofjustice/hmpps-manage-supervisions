import { Injectable } from '@nestjs/common'
import { maxBy } from 'lodash'
import { Conviction } from '../../community-api/client'
import { getElapsed, quantity } from '../../util'
import { DateTime } from 'luxon'
import { getOffenceName, getSentenceName } from '../sentence/util'
import { BreachService } from '../../community-api/breach'
import { ComplianceActiveBreachSummary, ComplianceConvictionSummary } from './compliance.types'

@Injectable()
export class ComplianceService {
  constructor(private readonly breach: BreachService) {}

  async convictionSummary(crn: string, conviction: Conviction): Promise<ComplianceConvictionSummary | null> {
    if (!conviction?.sentence) {
      return null
    }

    const elapsed = conviction.active
      ? getElapsed(
          conviction.sentence.startDate,
          conviction.sentence.originalLength,
          conviction.sentence.originalLengthUnits,
        )
      : null

    const { breaches, lastRecentBreachEnd = null } = await this.breach.getBreaches(crn, conviction.convictionId)
    const activeBreaches = breaches.filter(x => x.active)
    const activeBreach: ComplianceActiveBreachSummary | null =
      activeBreaches.length === 0
        ? null
        : {
            ...maxBy(activeBreaches, x => x.startDate.toJSDate()),
            active: true,
            additionalActiveBreaches: Math.max(0, activeBreaches.length - 1),
          }

    return {
      name: getSentenceName(conviction.sentence),
      progress: elapsed?.elapsed,
      startDate: DateTime.fromISO(conviction.sentence.startDate),
      endDate: conviction.sentence.terminationDate && DateTime.fromISO(conviction.sentence.terminationDate),
      length: quantity(conviction.sentence.originalLength, conviction.sentence.originalLengthUnits.toLowerCase()),
      mainOffence: getOffenceName(conviction.offences.find(x => x.mainOffence)),
      terminationReason: conviction.sentence.terminationReason,
      // in theory there should never be a case where these two sources of inBreach do not agree but you never know
      inBreach: conviction.inBreach || activeBreach !== null,
      activeBreach,
      previousBreaches: breaches.filter(x => !x.active),
      allBreaches: breaches,
      lastRecentBreachEnd,
    }
  }
}
