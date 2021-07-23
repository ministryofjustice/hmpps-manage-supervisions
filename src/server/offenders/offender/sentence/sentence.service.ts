import { Injectable, Logger } from '@nestjs/common'
import { CommunityApiService, Conviction, Offence, Sentence } from '../../../community-api'
import { maxBy } from 'lodash'
import { DateTime, DurationUnit } from 'luxon'
import { quantity, titleCase } from '../../../util'
import { ConvictionDetails } from './sentence.types'
import { RequirementService } from './requirement.service'

function getOffenceName(offence: Offence): string {
  return `${offence.detail.subCategoryDescription} (${quantity(offence.offenceCount || 1, 'count')})`
}

@Injectable()
export class SentenceService {
  private readonly logger = new Logger(SentenceService.name)

  constructor(private readonly community: CommunityApiService, private readonly requirements: RequirementService) {}

  async getConvictionDetails(crn: string): Promise<ConvictionDetails | null> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    const conviction = SentenceService.getLatestConviction(convictions)

    if (!conviction) {
      return null
    }

    const requirements = await this.requirements.getConvictionRequirements({
      crn,
      convictionId: conviction.convictionId,
    })

    const previousConvictions = convictions.filter(x => !x.active)
    const sentence = conviction.sentence
    const mainOffence = conviction.offences.find(x => x.mainOffence)

    return {
      previousConvictions: previousConvictions.length
        ? {
            count: previousConvictions.length,
            lastEnded: DateTime.fromISO(maxBy(previousConvictions, x => x.convictionDate).convictionDate),
            link: `/offenders/${crn}/previous-convictions`,
          }
        : null,
      offence: mainOffence && {
        id: mainOffence.offenceId,
        description: getOffenceName(mainOffence),
        category: mainOffence.detail.mainCategoryDescription,
        date: DateTime.fromISO(mainOffence.offenceDate),
        additionalOffences: conviction.offences.filter(x => !x.mainOffence).map(getOffenceName),
      },
      sentence: sentence
        ? {
            // TODO HACK: building this title is messy as the data is messy, we probably need a well known data source to clean it up.
            description: `${quantity(sentence.originalLength, sentence.originalLengthUnits, {
              plural: false,
            })} ${titleCase(sentence.sentenceType.description.replace('ORA', '').trim(), { ignoreAcronyms: true })}`,
            convictionDate: DateTime.fromISO(conviction.convictionDate),
            startDate: DateTime.fromISO(sentence.startDate),
            endDate: DateTime.fromISO(sentence.expectedSentenceEndDate),
            elapsed: this.getElapsed(sentence),
            courtAppearance: conviction.courtAppearance?.courtName,
            responsibleCourt: conviction.responsibleCourt?.courtName,
            additionalSentences:
              conviction.sentence.additionalSentences?.map(x => ({
                name: x.type.description,
                length: x.length,
                value: x.amount,
                notes: x.notes,
              })) || null,
          }
        : null,
      requirements,
    }
  }

  async getConvictionId(crn: string): Promise<Number> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    return SentenceService.getLatestConviction(convictions)?.convictionId
  }

  private static getLatestConviction(convictions: Conviction[]): Conviction {
    // TODO we are assuming only a single active conviction per offender at this time
    // TODO so in the case where we have multiple then just take the latest
    return maxBy(
      convictions.filter(x => x.active),
      x => x.convictionDate,
    )
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
