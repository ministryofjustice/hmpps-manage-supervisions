import { ClassConstructor } from 'class-transformer/types/interfaces'
import Agent, { HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'
import { ApiConfig } from '../config'
import { urlJoin } from '../utils/utils'
import logger from '../../logger'
import { plainToClass } from 'class-transformer'
import { sanitiseResponseError } from './SanitisedResponseError'

interface RestRequestOptions {
  query?: Record<string, string>
}

interface RestDataRequestOptions<T> extends RestRequestOptions {
  data: T
}

enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Patch = 'patch',
  Delete = 'delete',
}

function isIdempotent(method: HttpMethod) {
  switch (method) {
    case HttpMethod.Post:
      return false
    case HttpMethod.Get:
    case HttpMethod.Put:
    case HttpMethod.Patch:
    case HttpMethod.Delete:
      return true
    default:
      throw new Error(`unknown http method ${method}`)
  }
}

function mapBody<T>(cls: ClassOrArrayElementType<T>, response: superagent.Response): T {
  return plainToClass(cls, response.body, { excludeExtraneousValues: true }) as T
}

type ClassOrArrayElementType<T> = T extends readonly (infer T)[] ? ClassConstructor<T> : ClassConstructor<T>

export class RestClient {
  private readonly agent: Agent
  private readonly superagent: superagent.SuperAgentStatic & superagent.Request

  constructor(private readonly name: string, private readonly config: ApiConfig, token: string) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
    this.superagent = superagent.agent().timeout(this.config.timeout).accept('json').auth(token, { type: 'bearer' })
  }

  private async request<Body extends object = never>(
    method: HttpMethod,
    path: string,
    { query = {}, ...rest }: RestRequestOptions | RestDataRequestOptions<Body>,
  ): Promise<superagent.Response> {
    const url = urlJoin(this.config.url, path)
    const data = 'data' in rest ? rest.data : null
    const requestName = [
      `[${this.name}]`,
      method.toUpperCase(),
      url,
      query
        ? Object.entries(query)
            .map(([k, v]) => `${k}=${v}`)
            .join('&')
        : null,
      data ? JSON.stringify(data) : null,
    ]
      .filter(x => x)
      .join(' ')
    logger.info(requestName)

    const request = this.superagent[method](url).agent(this.agent).query(query)

    if (isIdempotent(method)) {
      request.retry(2, err => {
        // retry handler only for logging retries, not to influence retry logic
        if (err) {
          logger.warn(`${requestName} request failed, retrying: ${err.code || err.status} ${err.message}`)
        }
      })
    }

    if ('data' in rest) {
      request.type('json').send(rest.data)
    }

    try {
      return await request
    } catch (err) {
      const sanitisedError = sanitiseResponseError(err)
      logger.error(
        { ...sanitisedError, query },
        `${requestName} request failed: ${err.code || err.status} ${sanitisedError.message}`,
      )
      throw sanitisedError
    }
  }

  async get<T>(cls: ClassOrArrayElementType<T>, path: string, options: RestRequestOptions = {}): Promise<T> {
    const response = await this.request(HttpMethod.Get, path, options)
    return mapBody(cls, response)
  }

  async post<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    const response = await this.request(HttpMethod.Post, path, options)
    return mapBody(cls, response)
  }

  async put<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    const response = await this.request(HttpMethod.Put, path, options)
    return mapBody(cls, response)
  }

  async patch<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    const response = await this.request(HttpMethod.Patch, path, options)
    return mapBody(cls, response)
  }

  async delete<Response>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions = {},
  ): Promise<Response> {
    const response = await this.request(HttpMethod.Delete, path, options)
    return mapBody(cls, response)
  }
}
