import { Injectable, Logger, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client, custom, Issuer } from 'openid-client'
import { AuthApiConfig, ClientCredentials } from '../../config'
import { CacheService } from '../cache/cache.service'
import { urlJoin } from '../../util'

export function generateOauthClientToken(credentials: ClientCredentials): string {
  const token = Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')
  return `Basic ${token}`
}

@Injectable({ scope: Scope.DEFAULT })
export class HmppsOidcService {
  private readonly logger = new Logger(HmppsOidcService.name)
  private issuer: Issuer<Client>
  private readonly config: AuthApiConfig

  constructor(private readonly cache: CacheService, config: ConfigService) {
    this.config = config.get('apis.hmppsAuth')
  }

  async getDeliusUserToken({ username = '%ANONYMOUS%' }: User): Promise<string> {
    const credentials = this.config.systemClientCredentials
    return await this.cache.getOrSet(`oidc:client_credentials:${credentials.id}:delius:${username}`, async () => {
      const client = await this.getClient(credentials)
      const tokenSet = await client.grant({ grant_type: 'client_credentials', username })
      return { value: tokenSet.access_token, options: { durationSeconds: tokenSet.expires_in - 60 } }
    })
  }

  async tryRefresh(user: User): Promise<boolean> {
    if (!user.refreshToken) {
      this.logger.error(`cannot refresh '${user.userId}' (${user.username}) without a refresh token`)
      return false
    }

    const client = await this.getClient(this.config.apiClientCredentials)
    try {
      const tokenSet = await client.refresh(user.refreshToken)
      user.token = tokenSet.access_token
      user.expiresAt = tokenSet.expires_at
      user.refreshToken = tokenSet.refresh_token || user.refreshToken

      this.logger.log(`successfully refreshed '${user.userId}' (${user.username})`)
      return true
    } catch (err) {
      this.logger.error(`failed to refresh '${user.userId}' (${user.username}) ${err.message}`)
      return false
    }
  }

  private async getClient(credentials: ClientCredentials): Promise<Client> {
    const issuer = await this.getIssuer()
    const client = new issuer.Client({
      client_id: credentials.id,
      client_secret: credentials.secret,
    })

    client[custom.http_options] = options => {
      options.headers = Object.assign(options.headers, {
        Authorization: generateOauthClientToken(credentials),
      })
      return options
    }

    return client
  }

  private async getIssuer(): Promise<Issuer<Client>> {
    // TODO this issuer cache should be cleared out periodically
    if (this.issuer) {
      return this.issuer
    }

    const url = urlJoin(this.config.url, this.config.issuerPath)
    return (this.issuer = await Issuer.discover(url))
  }
}
