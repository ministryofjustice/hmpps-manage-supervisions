import { Injectable, Logger } from '@nestjs/common'
import { Config, DependentApisConfig } from '../../config'
import { kebabCase } from 'lodash'
import Axios from 'axios'
import { getRequestName, SanitisedAxiosError } from './SanitisedAxiosError'
import * as rax from 'retry-axios'
import { ConfigService } from '@nestjs/config'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'

export enum AuthenticationMethod {
  PassThroughUserToken,
  ReissueForDeliusUser,
}

@Injectable()
export class RestService {
  constructor(private readonly config: ConfigService<Config>, private readonly oidc: HmppsOidcService) {}

  build(
    name: keyof DependentApisConfig,
    user: User,
    authMethod: AuthenticationMethod = AuthenticationMethod.PassThroughUserToken,
  ) {
    const logger = new Logger(`${kebabCase(name)}-api-client`)
    const { url, timeout } = this.config.get<DependentApisConfig>('apis')[name]
    const axios = Axios.create({ baseURL: url.href, timeout })

    // response logging
    axios.interceptors.response.use(
      r => {
        logger.log(`${getRequestName(r.config)} -> ${r.status} ${r.statusText} ${JSON.stringify(r.data)}`)
        return r
      },
      err => {
        if (Axios.isAxiosError(err)) {
          const { currentRetryAttempt, retry } = rax.getConfig(err)
          const messages = [
            currentRetryAttempt ? `[retry ${currentRetryAttempt}/${retry}] ` : '',
            SanitisedAxiosError.getMessage(err),
          ].filter(x => x)
          logger.error(messages.join(' '))
        } else {
          logger.error('rest request failed', err)
        }
        // we have to re-throw as-is for the retry to work
        throw err
      },
    )

    // authorization header
    axios.interceptors.request.use(async config => {
      const token = await this.getToken(user, authMethod)
      return { ...config, headers: { ...config.headers, authorization: `Bearer ${token}` } }
    })

    // retry
    axios.defaults.raxConfig = {
      instance: axios,
      retry: 3,
    }
    rax.attach(axios)

    // sanitise error
    axios.interceptors.response.use(
      r => r,
      err => {
        if (Axios.isAxiosError(err)) {
          throw new SanitisedAxiosError(err)
        }
        throw err
      },
    )

    return axios
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
