import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client, custom, Issuer } from 'openid-client'
import { AuthApiConfig, ClientCredentials } from '../../config'
import { CacheService } from '../cache/cache.service'
import { urlJoin } from '../../util'
import { SimpleCache } from '../../util/simple-cache'

export function generateOauthClientToken(credentials: ClientCredentials): string {
  const token = Buffer.from(`${credentials.id}:${credentials.secret}`).toString('base64')
  return `Basic ${token}`
}

@Injectable()
export class HmppsOidcService {
  private readonly logger = new Logger(HmppsOidcService.name)
  private readonly config: AuthApiConfig

  /**
   * Local 30 minute cache of a promise to get the issuer.
   * This is here to prevent a race to get the issuer & no point this going out to remote cache.
   */
  private readonly issuerCache = new SimpleCache<Promise<Issuer<Client>>>({ stdTTL: 60 * 30, useClones: false })

  constructor(private readonly cache: CacheService, config: ConfigService) {
    this.config = config.get('apis.hmppsAuth')

    custom.setHttpOptionsDefaults({
      timeout: this.config.timeout,
    })
  }

  public async getDeliusUserToken({ username }: User): Promise<string> {
    if (!username) {
      throw new Error("Not getting client token on user's behalf - no username present on user object")
    }

    const credentials = this.config.systemClientCredentials

    return await this.cache.getOrSet(`oidc:client_credentials:${credentials.id}:delius:${username}`, async () => {
      const issuer = await this.getIssuer()
      const client = new issuer.Client({
        client_id: credentials.id,
        client_secret: credentials.secret,
      })

      client[custom.http_options] = (url, options) => {
        options.headers = Object.assign(options.headers, { Authorization: generateOauthClientToken(credentials) })
        return options
      }

      const tokenSet = await client.grant({ grant_type: 'client_credentials', username })
      this.logger.log('new hmpps-auth client credentials token', {
        id: credentials.id,
        username,
        expiresIn: tokenSet.expires_in,
        tokenType: tokenSet.token_type,
        scope: tokenSet.scope,
      })
      return { value: tokenSet.access_token, options: { durationSeconds: tokenSet.expires_in - 60 } }
    })
  }

  private async getIssuer() {
    return this.issuerCache.getOrSet('issuer', () => {
      const url = urlJoin(this.config.url, this.config.issuerPath)
      this.logger.log('getting hmpps-auth issuer', { url })
      return Issuer.discover(url)
    })
  }
}
