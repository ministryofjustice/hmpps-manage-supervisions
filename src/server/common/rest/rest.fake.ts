import { AxiosResponse } from 'axios'

export function fakeOkResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', config: {}, request: {}, headers: {} }
}
