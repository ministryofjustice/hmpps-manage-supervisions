import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { EligibilityService } from '../../community-api/eligibility'
import { Reflector } from '@nestjs/core'
import { CHECK_ELIGIBILITY_KEY, CheckEligibilityContext, IneligibilityCaseWarningRequired } from './eligibility.types'
import { Request } from 'express'

@Injectable()
export class CheckEligibilityInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly eligibility: EligibilityService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const {
      page,
      options: { crnParam },
    } = this.reflector.getAllAndOverride<CheckEligibilityContext>(CHECK_ELIGIBILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    const crn = request.params[crnParam]
    if (!crn) {
      throw new Error(
        `cannot determine CRN from param '${crnParam}' for ${CheckEligibilityInterceptor.name} of '${page}'`,
      )
    }

    const eligible = await this.eligibility.isEligibleOffender(crn)
    if (!eligible && this.eligibility.shouldDisplayEligibilityWarning(request.session, crn)) {
      throw new IneligibilityCaseWarningRequired(crn, page)
    }

    return next.handle().pipe(map(x => ({ ...x, caseEligibility: eligible })))
  }
}
