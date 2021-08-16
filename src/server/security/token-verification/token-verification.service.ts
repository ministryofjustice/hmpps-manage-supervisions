import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, DependentApisConfig } from '../../config'
import { RestService } from '../../common'

export interface TokenVerificationResponse {
  active: boolean
}

@Injectable()
export class TokenVerificationService {
  private readonly logger = new Logger(TokenVerificationService.name)

  constructor(private readonly config: ConfigService<Config>, private readonly rest: RestService) {}

  isEnabled(): boolean {
    return this.config.get<DependentApisConfig>('apis').tokenVerification.enabled
  }

  async verifyToken(user: User): Promise<boolean> {
    const client = this.rest.build('tokenVerification', user)
    try {
      const { data } = await client.post<TokenVerificationResponse>('/token/verify')
      return data?.active === true
    } catch (err) {
      this.logger.log('token expired', err)
      return false
    }
  }
}
