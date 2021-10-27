import { Injectable } from '@nestjs/common'
import { CommunityApiService } from '../community-api.service'
import { SanitisedAxiosError } from '../../common/rest'
import { Request } from 'express'

export enum OffenderEligibilityResult {
  Eligible,
  Ineligible,
  IneligibleDisplayWarning,
}

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

  async checkOffenderEligibility(session: Request['session'], crn: string): Promise<OffenderEligibilityResult> {
    if (!session.eligibility) {
      session.eligibility = {}
    }

    if (crn in session.eligibility) {
      return session.eligibility[crn] ? OffenderEligibilityResult.Eligible : OffenderEligibilityResult.Ineligible
    }

    const { success } = await SanitisedAxiosError.catchNotFound(() =>
      this.community.offender.getManageSupervisionsEligibilityUsingGET({ crn }),
    )
    return (session.eligibility[crn] = success)
      ? OffenderEligibilityResult.Eligible
      : OffenderEligibilityResult.IneligibleDisplayWarning
  }
}
