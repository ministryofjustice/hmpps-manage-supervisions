import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { AxiosInstance } from 'axios'
import { Request } from 'express'
import { BaseAPI } from './client/base'
import {
  AppointmentsApi,
  Configuration,
  CoreOffenderApi,
  SentenceRequirementsAndBreachApi,
  StaffApi,
  TeamsApi,
} from './client'
import { AuthenticationMethod, RestService } from '../common'

type ApiConstructor<Api> = {
  new (configuration?: Configuration, basePath?: string, axios?: AxiosInstance): Api
}

@Injectable({ scope: Scope.REQUEST })
export class CommunityApiService {
  private readonly axios: AxiosInstance

  constructor(@Inject(REQUEST) request: Request, rest: RestService) {
    this.axios = rest.build('community', request.user as User, AuthenticationMethod.ReissueForDeliusUser)
  }

  get appointment() {
    return this.api(AppointmentsApi)
  }

  get offender() {
    return this.api(CoreOffenderApi)
  }

  get team() {
    return this.api(TeamsApi)
  }

  get requirement() {
    return this.api(SentenceRequirementsAndBreachApi)
  }

  get staff() {
    return this.api(StaffApi)
  }

  private api<Api extends BaseAPI>(type: ApiConstructor<Api>): Api {
    return new type(null, '', this.axios)
  }
}
