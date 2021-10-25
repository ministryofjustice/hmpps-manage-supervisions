import { AxiosResponse } from 'axios'
import { SanitisedAxiosError } from './SanitisedAxiosError'
import { HttpStatus } from '@nestjs/common'

export function fakeOkResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', config: {}, request: {}, headers: {} }
}

export function fakeRestError(status: HttpStatus): SanitisedAxiosError {
  return new SanitisedAxiosError(
    {
      name: 'AxiosError',
      isAxiosError: true,
      config: { url: '/some-url', method: 'get' },
      request: {},
      response: { status, data: {}, statusText: 'OK', config: {}, headers: {} },
      message: 'Some fake axios error',
      toJSON() {
        return null
      },
      stack: 'Some stack trace',
    },
    { name: 'community', baseUrl: 'https://community-api' },
    1,
    123,
  )
}
