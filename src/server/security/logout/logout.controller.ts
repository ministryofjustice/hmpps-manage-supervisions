import { Controller, Get, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { Config, DependentApisConfig, ServerConfig } from '../../config'

@Controller('logout')
export class LogoutController {
  constructor(private readonly config: ConfigService<Config>) {}

  @Get()
  get(@Req() request: Request, @Res() response: Response) {
    const { externalUrl, apiClientCredentials } = this.config.get<DependentApisConfig>('apis').hmppsAuth
    const { domain } = this.config.get<ServerConfig>('server')
    const authLogoutUrl = `${externalUrl}/logout?client_id=${apiClientCredentials.id}&redirect_uri=${domain}`
    request.logOut()
    request.session.destroy(() => response.redirect(authLogoutUrl))
  }
}
