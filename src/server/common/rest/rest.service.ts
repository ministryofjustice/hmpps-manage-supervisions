import { Injectable } from '@nestjs/common'
import { Config, DependentApisConfig, ServerConfig } from '../../config'
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ApiMeta, SanitisedAxiosError } from './SanitisedAxiosError'
import axiosRetry from 'axios-retry'
import { ConfigService } from '@nestjs/config'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { ContextualNestLoggerService, LoggerService } from '../../logger'

declare module 'axios' {
  export interface AxiosRequestConfig {
    requestStarted?: number
  }
}

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
    const logger = this.logger.child({ api: apiMeta })

    axios.interceptors.request.use(config => {
      config.requestStarted = new Date().getTime()
      return config
    })

    if (authMethod !== AuthenticationMethod.None) {
      // authorization header
      axios.interceptors.request.use(async config => {
        const token = await this.getToken(user, authMethod)
        config.headers.authorization = `Bearer ${token}`
        return config
      })
    }

    // retry GET requests with response codes >= 500, exactly once, without delay
    axiosRetry(axios, { retries: 1 })

    // log successful responses or sanitise error & add retry meta
    axios.interceptors.response.use(
      r => {
        logger.log('request successful', {
          method: r.config.method.toUpperCase(),
          url: r.config.url,
          status: r.status,
          statusText: r.statusText,
          responseTime: RestService.getResponseTime(r.config),
          // do not log bodies in production mode as they may contain PII
          ...(isProduction ? {} : { requestBody: r.config.data, responseBody: r.data }),
        })
        return r
      },
      err => {
        if (Axios.isAxiosError(err)) {
          const responseTime = RestService.getResponseTime(err.config)
          const { retryCount } = err.config['axios-retry'] as any
          const sanitized = new SanitisedAxiosError(err, apiMeta, retryCount || 0, responseTime)

          logger.warn('request failed', sanitized)
          throw sanitized
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
        return await this.oidc.getDeliusUserToken(user)
    }
  }

  private static getResponseTime(config: AxiosRequestConfig) {
    // including all retries
    return config.requestStarted && new Date().getTime() - config.requestStarted
  }
}
