import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '../community-api.service'
import { DateTime } from 'luxon'
import { Conviction } from '../client'
import { maxBy } from 'lodash'

@Injectable()
export class ConvictionService {
  constructor(private readonly community: CommunityApiService) {}

  async getConvictions(crn: string, from?: DateTime): Promise<{ current?: Conviction; previous: Conviction[] }> {
    const { data: convictions } = await this.community.offender.getConvictionsForOffenderByCrnUsingGET({ crn })

    const current = ConvictionService.getLatestConviction(convictions)
    const previous = convictions.filter(
      c =>
        !c.active && (!from || (c.sentence?.terminationDate && DateTime.fromISO(c.sentence.terminationDate) >= from)),
    )

    return { current, previous }
  }

  private static getLatestConviction(convictions: Conviction[]): Conviction {
    // TODO we are assuming only a single active conviction per offender at this time
    // TODO so in the case where we have multiple then just take the latest
    return (
      maxBy(
        convictions.filter(x => x.active),
        x => x.convictionDate,
      ) || null
    )
  }
}
