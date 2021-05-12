import { Injectable } from '@nestjs/common'
import { RestService } from '../../common'
import { Expose } from 'class-transformer'
import { ConfigService } from '@nestjs/config'
import { Config, DependentApisConfig } from '../../config'

export class TokenVerificationResponse {
  @Expose()
  active: boolean
}

@Injectable()
export class TokenVerificationService {
  constructor(private readonly rest: RestService, private readonly config: ConfigService<Config>) {}

  isEnabled(): boolean {
    return this.config.get<DependentApisConfig>('apis').tokenVerification.enabled
  }

  async verifyToken(user: User): Promise<boolean> {
    const client = await this.rest.build('tokenVerification', user)
    const result = await client.post(TokenVerificationResponse, '/token/verify')
    return result?.active === true
  }
}