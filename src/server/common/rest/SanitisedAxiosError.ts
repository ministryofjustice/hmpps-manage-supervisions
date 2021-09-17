import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { HttpStatus } from '@nestjs/common'
import { urlJoin } from '../../util'

export function getRequestName(request: AxiosRequestConfig): string {
  return [
    request.method?.toUpperCase(),
    urlJoin(request.baseURL, request.url),
    request.data ? JSON.stringify(request.data) : null,
  ]
    .filter(x => x)
    .join(' ')
}

/**
 * Wraps an axios errors, that may contain sensitive request headers.
 */
export class SanitisedAxiosError extends Error {
  constructor(inner: AxiosError) {
    super(SanitisedAxiosError.getMessage(inner))
    this.status = (inner.response?.status as HttpStatus) || null
  }

  readonly status: HttpStatus

  public static getMessage(err: AxiosError): string {
    const requestName = getRequestName(err.config)
    const message = err.response
      ? [err.response.status, err.response.statusText, err.response.data ? JSON.stringify(err.response.data) : null]
          .filter(x => x)
          .join(' ')
      : err.message
    return `${requestName} -> ${message}`
  }

  static async catchStatus<T>(action: () => Promise<AxiosResponse<T>>, ...statuses: HttpStatus[]): Promise<T | null> {
    try {
      const { data } = await action()
      return data
    } catch (err) {
      if (err instanceof SanitisedAxiosError && statuses.includes(err.status)) {
        return null
      }
      throw err
    }
  }

  static async catchNotFound<T>(action: () => Promise<AxiosResponse<T>>) {
    return this.catchStatus(action, HttpStatus.NOT_FOUND)
  }
}
