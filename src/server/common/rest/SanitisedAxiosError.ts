import { AxiosError, AxiosPromise } from 'axios'
import { HttpStatus } from '@nestjs/common'
import { DependentApisConfig } from '../../config'

export interface ApiMeta {
  name: keyof DependentApisConfig
  baseUrl: string
}

/**
 * Wraps an axios errors, that may contain sensitive request headers.
 */
export class SanitisedAxiosError extends Error {
  constructor(
    inner: AxiosError,
    public readonly api: ApiMeta,
    public readonly retries: number,
    public readonly responseTime: number,
  ) {
    super(inner.message)
    this.stack = inner.stack
    this.name = SanitisedAxiosError.name
    this.request = {
      url: inner.config.url,
      method: inner.config.method?.toUpperCase(),
    }
    this.response = inner.response
      ? {
          status: inner.response.status as HttpStatus,
          statusText: inner.response.statusText,
          data: inner.response.data,
        }
      : null
  }

  readonly request: {
    url: string
    method: string
  }

  readonly response?: {
    status: HttpStatus
    statusText: string
    data?: any
  }

  static async catchStatus<T>(
    action: () => AxiosPromise<T>,
    ...statuses: (HttpStatus | [HttpStatus, HttpStatus])[]
  ): Promise<{ data: T; status?: HttpStatus; success: boolean }> {
    try {
      const response = await action()
      return { data: response.data, status: response.status, success: true }
    } catch (err) {
      if (
        err instanceof SanitisedAxiosError &&
        err.response?.status &&
        statuses.some(statusOrRange =>
          Array.isArray(statusOrRange)
            ? err.response.status >= statusOrRange[0] && err.response.status <= statusOrRange[1]
            : err.response.status === statusOrRange,
        )
      ) {
        return { data: null, status: err.response?.status, success: false }
      }
      throw err
    }
  }

  static async catchNotFound<T>(action: () => AxiosPromise<T>) {
    return this.catchStatus(action, HttpStatus.NOT_FOUND)
  }

  static SERVICE_UNAVAILABLE_STATUSES: (HttpStatus | [HttpStatus, HttpStatus])[] = [
    HttpStatus.TOO_MANY_REQUESTS,
    [500, 599],
  ]
}
