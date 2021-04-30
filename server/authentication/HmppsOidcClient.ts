import { Service } from 'typedi'
import { Client, Issuer } from 'openid-client'
import { AuthApiConfig, ConfigService } from '../config'
import { CacheService } from '../data/CacheService'
import { urlJoin } from '../utils/utils'

@Service({ global: true })
export class HmppsOidcClient {
  private issuer: Issuer<Client>
  private readonly config: AuthApiConfig

  constructor(private readonly cache: CacheService, config: ConfigService) {
    this.config = config.apis.hmppsAuth
  }

  public async getDeliusUserToken({ username = '%ANONYMOUS%' }: UserPrincipal): Promise<string> {
    const credentials = this.config.systemClientCredentials

    return await this.cache.getOrSet(`oidc:client_credentials:${credentials.id}:delius:${username}`, async () => {
      const issuer = await this.getIssuer()
      const client = new issuer.Client({
        client_id: credentials.id,
        client_secret: credentials.secret,
      })

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
