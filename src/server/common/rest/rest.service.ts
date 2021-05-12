import { HttpService, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { Config, DependentApisConfig } from '../../config'
import { RestClient } from './rest-client'

export enum AuthenticationMethod {
  PassThroughUserToken,
  ReissueForDeliusUser,
}

@Injectable()
export class RestService {
  constructor(
    private readonly config: ConfigService<Config>,
    private readonly oidc: HmppsOidcService,
    private readonly http: HttpService,
  ) {}

  async build(
    name: keyof DependentApisConfig,
    user: User,
    authMethod: AuthenticationMethod = AuthenticationMethod.PassThroughUserToken,
  ): Promise<RestClient> {
    const token = await this.getToken(user, authMethod)
    return new RestClient(this.http, name, this.config.get<DependentApisConfig>('apis')[name], token)
  }

  private async getToken(user: User, authMethod: AuthenticationMethod): Promise<string> {
    switch (authMethod) {
      case AuthenticationMethod.PassThroughUserToken:
        return user.token
      case AuthenticationMethod.ReissueForDeliusUser:
        // TODO assert this is really a delius user token?
        return await this.oidc.getDeliusUserToken(user)
    }
  }
}
