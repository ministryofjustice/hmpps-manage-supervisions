import { ClassConstructor, plainToClass } from 'class-transformer'
import { ApiConfig } from '../../config'
import { HttpService, Logger } from '@nestjs/common'
import * as qs from 'qs'
import { Observable, throwError } from 'rxjs'
import { AxiosError, AxiosRequestConfig } from 'axios'
import { catchError, map, retry, tap } from 'rxjs/operators'

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

type ClassOrArrayElementType<T> = T extends readonly (infer T)[] ? ClassConstructor<T> : ClassConstructor<T>

function isAxiosError(err: any): err is AxiosError {
  return err.isAxiosError === true
}

export class RestClientError extends Error {
  constructor(public requestName: string, err: AxiosError) {
    super(RestClientError.getMessage(requestName, err))
  }

  private static getMessage(requestName: string, err: AxiosError): string {
    // the axios error contains requests headers that will contain sensitive data
    const message = err.response
      ? [err.response.status, err.response.statusText, err.response.data ? JSON.stringify(err.response.data) : null]
          .filter(x => x)
          .join(' ')
      : err.message
    return `${requestName} -> ${message}`
  }
}

export class RestClient {
  private readonly logger = new Logger()
  private readonly baseRequest: AxiosRequestConfig

  constructor(private readonly http: HttpService, private readonly name: string, config: ApiConfig, token: string) {
    this.baseRequest = {
      baseURL: config.url,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  private request<T = never>(
    cls: ClassOrArrayElementType<T>,
    method: HttpMethod,
    path: string,
    { query = {}, ...rest }: RestRequestOptions | RestDataRequestOptions<T>,
  ): Observable<T> {
    const url = path + qs.stringify(query, { addQueryPrefix: true })
    const data = 'data' in rest ? rest.data : null
    const requestName = [`[${this.name}]`, method.toUpperCase(), url, data ? JSON.stringify(data) : null]
      .filter(x => x)
      .join(' ')

    const $result = this.http.request<T>({ url, method, data, ...this.baseRequest }).pipe(
      tap(
        r => this.logger.log(`${requestName} -> ${r.status} ${r.statusText} ${JSON.stringify(r.data)}`),
        err => {
          if (isAxiosError(err)) {
            const restError = new RestClientError(requestName, err)
            this.logger.error(restError.message)
          } else {
            this.logger.error(`${requestName} -> ${err.message}`)
          }
        },
      ),
      map(x => plainToClass(cls, x.data, { excludeExtraneousValues: true }) as T),
    )

    // TODO the retry count should be configurable
    const $retried = isIdempotent(method) ? $result.pipe(retry(2)) : $result
    return $retried.pipe(
      catchError(err => {
        return throwError(isAxiosError(err) ? new RestClientError(requestName, err) : err)
      }),
    )
  }

  async get<T>(cls: ClassOrArrayElementType<T>, path: string, options: RestRequestOptions = {}): Promise<T> {
    return this.request<T>(cls, HttpMethod.Get, path, options).toPromise()
  }

  async post<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    return this.request<Response>(cls, HttpMethod.Post, path, options).toPromise()
  }

  async put<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    return this.request<Response>(cls, HttpMethod.Put, path, options).toPromise()
  }

  async patch<Response, Request extends object = never>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions | RestDataRequestOptions<Request> = {},
  ): Promise<Response> {
    return this.request<Response>(cls, HttpMethod.Patch, path, options).toPromise()
  }

  async delete<Response>(
    cls: ClassOrArrayElementType<Response>,
    path: string,
    options: RestRequestOptions = {},
  ): Promise<Response> {
    return this.request<Response>(cls, HttpMethod.Delete, path, options).toPromise()
  }
}
