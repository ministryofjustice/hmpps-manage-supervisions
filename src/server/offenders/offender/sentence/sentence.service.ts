import { Injectable, Logger } from '@nestjs/common'
import { CommunityApiService, isRar, Offence, Requirement, Sentence } from '../../../community-api'
import { maxBy } from 'lodash'
import { DateTime, Duration, DurationUnit } from 'luxon'
import { quantity } from '../../../util/math'
import { ConvictionOffence, ConvictionDetails } from './sentence.types'

@Injectable()
export class SentenceService {
  private readonly logger = new Logger(SentenceService.name)

  constructor(private readonly community: CommunityApiService) {}

  async getConvictionDetails(crn: string): Promise<ConvictionDetails | null> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    // TODO we are assuming only a single active conviction per offender at this time
    // TODO so in the case where we have multiple then just take the latest
    const conviction = maxBy(
      convictions.filter(x => x.active),
      x => x.convictionDate,
    )
    if (!conviction) {
      return null
    }

    const {
      data: { requirements },
    } = await this.community.requirement.getRequirementsByConvictionIdUsingGET({
      crn,
      convictionId: conviction.convictionId,
      activeOnly: true,
    })
    const rar = requirements
      .map(x => this.getRarMeta(x))
      .filter(x => x)
      .reduce((x, y) => ({ length: x.length + y.length, progress: x.progress + y.progress }), {
        length: 0,
        progress: 0,
      })

    function toOffenceView(offence?: Offence): ConvictionOffence | null {
      if (!offence) {
        return null
      }
      return {
        id: offence.offenceId,
        description: offence.detail.description,
        date: DateTime.fromISO(offence.offenceDate),
      }
    }

    const previousConvictions = convictions.filter(x => !x.active)
    const sentence = conviction.sentence
    return {
      previousConvictions: previousConvictions.length
        ? {
            count: previousConvictions.length,
            lastEnded: DateTime.fromISO(maxBy(previousConvictions, x => x.convictionDate).convictionDate),
            link: `/offenders/${crn}/previous-convictions`,
          }
        : null,
      mainOffence: toOffenceView(conviction.offences.find(x => x.mainOffence)),
      additionalOffences: conviction.offences.filter(x => !x.mainOffence).map(toOffenceView),
      sentence: sentence
        ? {
            description: sentence.description,
            convictionDate: DateTime.fromISO(conviction.convictionDate),
            startDate: DateTime.fromISO(sentence.startDate),
            endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
            length: quantity(sentence.originalLength, sentence.originalLengthUnits),
            elapsed: this.getElapsed(sentence),
            courtAppearance: conviction.courtAppearance?.courtName,
            responsibleCourt: conviction.responsibleCourt?.courtName,
          }
        : null,
      requirement:
        rar.length > 0
          ? {
              length: quantity(rar.length, 'days'),
              progress: quantity(rar.progress, 'days'),
            }
          : null,
    }
  }

  private getRarMeta(requirement: Requirement): { length: number; progress: number } | null {
    if (!isRar(requirement) || !requirement.lengthUnit || !requirement.length) {
      return null
    }

    const units = requirement.lengthUnit.toLowerCase().trim()
    if (units === 'day' || units === 'days') {
      return { length: requirement.length, progress: requirement.rarCount || 0 }
    }

    try {
      return {
        length: Math.floor(Duration.fromObject({ [units]: requirement.length }).as('days')),
        progress: requirement.rarCount || 0,
      }
    } catch (err) {
      this.logger.error(`Cannot determine rar days ${JSON.stringify(requirement)}: ${err.message}`)
      return null
    }
  }

  private getElapsed(sentence: Sentence): string | null {
    if (!sentence.originalLengthUnits || !sentence.originalLength) {
      return null
    }
    try {
      const units = sentence.originalLengthUnits.toLowerCase() as DurationUnit
      const start = DateTime.fromISO(sentence.startDate)
      const elapsed = Math.min(Math.floor(DateTime.now().diff(start, units).as(units)), sentence.originalLength)
      if (elapsed < 0) {
        // a future sentence
        return null
      }

      return `${quantity(elapsed, units)} elapsed (of ${quantity(sentence.originalLength, units)})`
    } catch (err) {
      // probably bad units
      this.logger.error(`Cannot determine sentence duration ${JSON.stringify(sentence)}: ${err.message}`)
      return null
    }
  }
}
