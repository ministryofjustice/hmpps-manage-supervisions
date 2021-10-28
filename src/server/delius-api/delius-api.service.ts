import { Inject, Injectable, Scope } from '@nestjs/common'
import { Configuration, ContactV1Api, DocumentV1Api } from './client'
import { AxiosInstance } from 'axios'
import { REQUEST } from '@nestjs/core'
import { AuthenticationMethod, RestService } from '../common'
import { Request } from 'express'
import { BaseAPI } from './client/base'

type ApiConstructor<Api> = {
  new (configuration?: Configuration, basePath?: string, axios?: AxiosInstance): Api
}

@Injectable({ scope: Scope.REQUEST })
export class DeliusApiService {
  private readonly axios: AxiosInstance

  constructor(@Inject(REQUEST) request: Request, rest: RestService) {
    this.axios = rest.build('community', request.user as User, AuthenticationMethod.ReissueForDeliusUser)
  }

  get contactV1() {
    return this.api(ContactV1Api)
  }

  get documentV1() {
    return this.api(DocumentV1Api)
  }

  private api<Api extends BaseAPI>(type: ApiConstructor<Api>): Api {
    return new type(null, '', this.axios)
  }
}
