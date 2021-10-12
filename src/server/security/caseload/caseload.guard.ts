import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { CommunityApiService } from '../../community-api'
import { Reflector } from '@nestjs/core'
import { CASELOAD_KEY, CaseloadGuardOptions } from './caseload-only.decorator'
import { NonCaseloadAccessError } from './caseload.types'

@Injectable()
export class CaseloadGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly community: CommunityApiService) {}

  async canActivate(context: ExecutionContext) {
    const { crnParam } = this.reflector.getAllAndOverride<CaseloadGuardOptions>(CASELOAD_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<Request>()
    const crn = request.params[crnParam]
    if (!crn) {
      return false
    }

    const user = request.user as User
    const username = user?.username
    if (!username) {
      return false
    }

    const { data } = await this.community.staff.getCasesUsingGET({ username, unpaged: true })
    if (!data.content?.some(x => x.crn === crn)) {
      throw new NonCaseloadAccessError(crn, username)
    }

    return true
  }
}
