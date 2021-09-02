import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, DependentApisConfig, ServerConfig } from '../../config'
import { URL } from 'url'
import { urlJoin } from '../../util'

@Injectable()
export class LogoutService {
  constructor(private readonly config: ConfigService<Config>) {}

  getLogoutUrl(): string {
    const {
      hmppsAuth: { externalUrl: hmmppsAuthUrl, apiClientCredentials },
    } = this.config.get<DependentApisConfig>('apis')
    const { domain } = this.config.get<ServerConfig>('server')
    const url = new URL(urlJoin(hmmppsAuthUrl, 'logout'))
    url.searchParams.set('client_id', apiClientCredentials.id)
    url.searchParams.set('redirect_uri', domain.href)
    return url.href
  }
}
