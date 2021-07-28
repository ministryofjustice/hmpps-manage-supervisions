import { Injectable } from '@nestjs/common'
import { OffenderDetail, OffenderDetailSummary } from '../../community-api/client'
import { CommunityApiService } from '../../community-api'

@Injectable()
export class OffenderService {
  constructor(private readonly community: CommunityApiService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getOffenderSummary(crn: string): Promise<OffenderDetailSummary> {
    const { data } = await this.community.offender.getOffenderSummaryByCrnUsingGET({ crn })
    return data
  }
}
