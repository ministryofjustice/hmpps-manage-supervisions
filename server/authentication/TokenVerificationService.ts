import logger from '../../logger'
import { Service } from 'typedi'
import { RestClientFactory } from '../data/RestClientFactory'
import { Expose } from 'class-transformer'
import { ConfigService } from '../config'

export class TokenVerificationResponse {
  @Expose()
  active: boolean
}

@Service()
export class TokenVerificationService {
  constructor(private readonly factory: RestClientFactory, private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return this.config.apis.tokenVerification.enabled
  }

  async verifyToken(user: UserPrincipal): Promise<boolean> {
    logger.debug(`token request for user '${user.username}'`)

    const client = await this.factory.build('tokenVerification', user)
    const result = await client.post(TokenVerificationResponse, '/token/verify')
    return result?.active === true
  }
}
