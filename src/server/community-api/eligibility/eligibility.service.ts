import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '../community-api.service'
import { SanitisedAxiosError } from '../../common/rest'
import { Request } from 'express'

@Injectable()
export class EligibilityService {
  constructor(private readonly community: CommunityApiService) {}

  async isInEligibleCaseload(user: User, crn: string): Promise<boolean> {
    if (!user.username) {
      throw new Error('current user has no username')
    }

    const {
      data: { content: cases },
    } = await this.community.staff.getManageSupervisionsEligibleOffendersUsingGET({
      username: user.username,
      unpaged: true,
    })
    return cases?.some(x => x.crn === crn) || false
  }

  async isEligibleOffender(crn: string): Promise<boolean> {
    const result = await SanitisedAxiosError.catchNotFound(() =>
      this.community.offender.getManageSupervisionsEligibilityUsingGET({ crn }),
    )
    return !!result
  }

  shouldDisplayEligibilityWarning(session: Request['session'], crn: string): boolean {
    if (!session.eligibility?.warningDisplayed) {
      session.eligibility = { warningDisplayed: [crn] }
      return true
    }

    if (!session.eligibility.warningDisplayed.includes(crn)) {
      session.eligibility.warningDisplayed.push(crn)
      return true
    }

    return false
  }
}
