import { Injectable, Scope } from '@nestjs/common'
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
  private issuer: Issuer<Client>
  private readonly config: AuthApiConfig

  constructor(private readonly cache: CacheService, config: ConfigService) {
    this.config = config.get('apis.hmppsAuth')
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

      client[custom.http_options] = options => {
        options.headers = Object.assign(options.headers, { Authorization: generateOauthClientToken(credentials) })
        return options
      }

      const tokenSet = await client.grant({ grant_type: 'client_credentials', username })
      return { value: tokenSet.access_token, options: { durationSeconds: tokenSet.expires_in - 60 } }
    })
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
