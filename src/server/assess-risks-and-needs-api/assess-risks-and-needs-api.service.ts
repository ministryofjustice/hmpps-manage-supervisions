import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { AxiosInstance } from 'axios'
import { Request } from 'express'
import { BaseAPI } from './client/base'
import { Configuration, RisksControllerApi } from './client'
import { AuthenticationMethod, RestService } from '../common'

type ApiConstructor<Api> = {
  new (configuration?: Configuration, basePath?: string, axios?: AxiosInstance): Api
}

@Injectable({ scope: Scope.REQUEST })
export class AssessRisksAndNeedsApiService {
  private readonly axios: AxiosInstance

  constructor(@Inject(REQUEST) request: Request, rest: RestService) {
    this.axios = rest.build('assessRisksAndNeeds', request.user as User, AuthenticationMethod.ReissueForDeliusUser)
  }

  get risk() {
    return this.api(RisksControllerApi)
  }

  private api<Api extends BaseAPI>(type: ApiConstructor<Api>): Api {
    return new type(null, '', this.axios)
  }
}
