import { AxiosResponse } from 'axios'
import { SanitisedAxiosError } from './SanitisedAxiosError'
import { HttpStatus } from '@nestjs/common'

export function fakeOkResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', config: {}, request: {}, headers: {} }
}

export function fakeRestError(status: HttpStatus): SanitisedAxiosError {
  return new SanitisedAxiosError({
    response: { status, data: {}, statusText: 'OK', config: {}, headers: {} },
    isAxiosError: true,
    config: {},
    name: 'Some fake axios error',
    message: 'Some fake axios error',
    request: {},
    toJSON() {
      return null
    },
  })
}
