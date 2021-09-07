import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../../config'
import { URL } from 'url'
import { LoginService } from './login.service'

@Injectable()
export class LoginGuard extends AuthGuard('hmpps') {
  constructor(private readonly config: ConfigService, private readonly url: LoginService) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean
    const request = context.switchToHttp().getRequest()
    await super.logIn(request)
    return result
  }

  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions | undefined {
    const request = context.switchToHttp().getRequest<Request>()
    const { domain } = this.config.get<ServerConfig>('server')
    const callback = new URL('/login/callback', domain.toString())
    callback.searchParams.set('redirect', this.url.sanitiseRedirectUrl(request))
    return { callbackURL: callback.toString() }
  }
}
