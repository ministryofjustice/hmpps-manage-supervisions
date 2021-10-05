import { Injectable } from '@nestjs/common'
import { Config, DependentApisConfig, ServerConfig } from '../../config'
import Axios, { AxiosInstance } from 'axios'
import { ApiMeta, SanitisedAxiosError } from './SanitisedAxiosError'
import * as rax from 'retry-axios'
import { ConfigService } from '@nestjs/config'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { ContextualNestLoggerService, LoggerService } from '../../logger'

export enum AuthenticationMethod {
  None,
  PassThroughUserToken,
  ReissueForDeliusUser,
}

@Injectable()
export class RestService {
  private readonly logger: ContextualNestLoggerService
  constructor(
    private readonly config: ConfigService<Config>,
    private readonly oidc: HmppsOidcService,
    logger: LoggerService,
  ) {
    this.logger = logger.of(RestService.name)
  }

  build(
    name: keyof DependentApisConfig,
    user: User,
    authMethod: AuthenticationMethod = AuthenticationMethod.PassThroughUserToken,
  ): AxiosInstance {
    const { url, timeout } = this.config.get<DependentApisConfig>('apis')[name]
    const { isProduction } = this.config.get<ServerConfig>('server')
    const axios = Axios.create({ baseURL: url.href, timeout })
    const apiMeta: ApiMeta = { name, baseUrl: url.href }
    const logger = this.logger.child(apiMeta)

    // response logging
    axios.interceptors.response.use(
      r => {
        logger.log('request successful', {
          method: r.config.method.toUpperCase(),
          url: r.config.url,
          status: r.status,
          statusText: r.statusText,
          // do not log bodies in production mode as they may contain PII
          ...(isProduction ? {} : { requestBody: r.config.data, responseBody: r.data }),
        })
        return r
      },
      err => {
        if (Axios.isAxiosError(err)) {
          // on failed requests, log retries only - since we're re-throwing, we can expect the consumer service to log,
          // or for the exception to bubble up to be unhandled where it will be logged by nest.
          const { currentRetryAttempt, retry: totalRetryAttempts } = rax.getConfig(err)
          if (currentRetryAttempt) {
            logger.warn(
              `request failed on retry ${currentRetryAttempt}/${totalRetryAttempts}`,
              new SanitisedAxiosError(err, apiMeta),
            )
          }
        }
        // we have to re-throw as-is for the retry to work
        throw err
      },
    )

    if (authMethod !== AuthenticationMethod.None) {
      // authorization header
      axios.interceptors.request.use(async config => {
        const token = await this.getToken(user, authMethod)
        return { ...config, headers: { ...config.headers, authorization: `Bearer ${token}` } }
      })
    }

    // retry
    axios.defaults.raxConfig = {
      instance: axios,
      retry: 3,
      backoffType: 'static',
      retryDelay: 100,
    }
    rax.attach(axios)

    // sanitise error
    axios.interceptors.response.use(
      r => r,
      err => {
        if (Axios.isAxiosError(err)) {
          throw new SanitisedAxiosError(err, apiMeta)
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
