import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '../community-api'
import { getDisplayName } from '../util'
import { Case } from './cases.types'

@Injectable()
export class CasesService {
  constructor(private readonly community: CommunityApiService) {}

  async getCases(username: string): Promise<Case[]> {
    const {
      data: { content: cases },
    } = await this.community.staff.getCasesUsingGET({
      username,
      unpaged: true,
    })

    return cases?.map(offenderCase => {
      return {
        crn: offenderCase.crn,
        name: getDisplayName(offenderCase),
      }
    })
  }
}
