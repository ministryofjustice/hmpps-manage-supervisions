import { AxiosError, AxiosResponse } from 'axios'
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
  constructor(inner: AxiosError, public readonly api: ApiMeta) {
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

  static async catchStatus<T>(action: () => Promise<AxiosResponse<T>>, ...statuses: HttpStatus[]): Promise<T | null> {
    try {
      const { data } = await action()
      return data
    } catch (err) {
      if (err instanceof SanitisedAxiosError && err.response && statuses.includes(err.response.status)) {
        return null
      }
      throw err
    }
  }

  static async catchNotFound<T>(action: () => Promise<AxiosResponse<T>>) {
    return this.catchStatus(action, HttpStatus.NOT_FOUND)
  }
}
