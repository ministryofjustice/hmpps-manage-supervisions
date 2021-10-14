import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { Reflector } from '@nestjs/core'
import { ELIGIBLE_CASELOAD_KEY, EligibleCaseloadOnlyOptions, NonEligibleCaseloadAccessError } from './eligibility.types'
import { EligibilityService } from '../../community-api/eligibility'

@Injectable()
export class EligibleCaseloadGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly eligibility: EligibilityService) {}

  async canActivate(context: ExecutionContext) {
    const { crnParam } = this.reflector.getAllAndOverride<EligibleCaseloadOnlyOptions>(ELIGIBLE_CASELOAD_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    const crn = request.params[crnParam]
    if (!crn) {
      return false
    }

    if (!(await this.eligibility.isInEligibleCaseload(request.user as User, crn))) {
      throw new NonEligibleCaseloadAccessError(crn)
    }

    return true
  }
}
