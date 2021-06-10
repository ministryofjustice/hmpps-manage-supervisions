import { Reflector } from '@nestjs/core'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { PUBLIC_KEY } from '../meta/public.decorator'
import { TokenVerificationService } from '../token-verification/token-verification.service'
import { HmppsOidcService } from '../../common'
import { DateTime } from 'luxon'
import { ConfigService } from '@nestjs/config'
import { Config, ServerConfig } from '../../config'

/**
 * The minimum validity in seconds of an access token before it should be refreshed.
 * This needs to be enough time for a request using this token to complete but not so long that we refresh too often.
 */
const TOKEN_GRACE_SECONDS = 60

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly config: ServerConfig

  constructor(
    private readonly reflector: Reflector,
    private readonly tokenVerification: TokenVerificationService,
    private readonly oidc: HmppsOidcService,
    config: ConfigService<Config>,
  ) {
    this.config = config.get('server')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [context.getHandler(), context.getClass()])
    if (isPublic) {
      return true
    }

    if (!request.isAuthenticated()) {
      return false
    }

    const user = request.user as User
    if (await this.assertToken(user)) {
      return true
    }

    return this.config.refreshEnabled ? await this.oidc.tryRefresh(user) : false
  }

  private async assertToken(user: User): Promise<boolean> {
    if (!user.token || !user.expiresAt) {
      return false
    }

    const expiresIn = user.expiresAt - DateTime.utc().toSeconds()
    if (expiresIn < TOKEN_GRACE_SECONDS) {
      return false
    }

    if (!this.tokenVerification.isEnabled()) {
      return true
    }

    return await this.tokenVerification.verifyToken(user)
  }
}
