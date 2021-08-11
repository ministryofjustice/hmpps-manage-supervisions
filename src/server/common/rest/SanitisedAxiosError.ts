import { AxiosError, AxiosRequestConfig } from 'axios'
import { HttpStatus } from '@nestjs/common'

export function getRequestName(request: AxiosRequestConfig): string {
  return [
    request.method?.toUpperCase(),
    request.baseURL,
    request.url,
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
}
