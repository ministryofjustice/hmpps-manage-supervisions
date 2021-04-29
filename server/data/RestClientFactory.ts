import { Service } from 'typedi'
import { ConfigService, DependentApisConfig } from '../config'
import { HmppsOidcClient } from '../authentication/HmppsOidcClient'
import { RestClient } from './RestClient'

export enum AuthenticationMethod {
  PassThroughUserToken,
  ReissueForDeliusUser,
}

@Service()
export class RestClientFactory {
  constructor(private readonly config: ConfigService, private readonly auth: HmppsOidcClient) {}

  async build(
    name: keyof DependentApisConfig,
    user: UserPrincipal,
    authMethod: AuthenticationMethod = AuthenticationMethod.PassThroughUserToken,
  ): Promise<RestClient> {
    const token = await this.getToken(user, authMethod)
    return new RestClient(name, this.config.apis[name], token)
  }

  private async getToken(user: UserPrincipal, authMethod: AuthenticationMethod): Promise<string> {
    switch (authMethod) {
      case AuthenticationMethod.PassThroughUserToken:
        return user.token
      case AuthenticationMethod.ReissueForDeliusUser:
        // TODO assert this is really a delius user token?
        return await this.auth.getDeliusUserToken(user)
    }
  }
}
