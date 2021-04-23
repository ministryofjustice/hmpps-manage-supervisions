import { ValidationError } from 'class-validator'

// TODO why does this eslint setup hate typescript enums?!
// eslint-disable-next-line no-shadow
export enum ParamSource {
  Url = 'params',
  Query = 'query',
  Body = 'body',
  Request = 'req',
  Response = 'res',
}

export interface ParamMeta {
  src: ParamSource
  type: Function
  index: number
}

// eslint-disable-next-line no-shadow
export enum HttpMethod {
  Get = 'get',
  Post = 'post',
}

export interface EndpointMeta {
  action: Function
  path?: string
  template?: string
  method?: HttpMethod
  params: Record<string, ParamMeta>
}

export interface ControllerMeta {
  type: Function
  path?: string
  endpoints: EndpointMeta[]
}

export interface ViewModel<T> {
  dto: T
  errors?: ValidationError[] | null
}
