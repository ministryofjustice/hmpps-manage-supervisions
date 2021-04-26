import { Service } from 'typedi'
import { ControllerMeta, EndpointMeta, HttpMethod, ParamSource } from './types'
import { ControllerContext } from './controller.context'

const MetaKey = {
  CONTROLLER: Symbol.for('CONTROLLER'),
}

function getOrSetMeta<T>(key: string | symbol, factory: () => T, target: Function, propertyKey?: string | symbol): T {
  let meta = Reflect.getMetadata(key, target, propertyKey)
  if (meta) {
    return meta as T
  }
  meta = factory()
  Reflect.defineMetadata(key, meta, target, propertyKey)
  return meta
}

function getControllerMeta(target: Function) {
  return getOrSetMeta<ControllerMeta>(MetaKey.CONTROLLER, () => ({ type: target, endpoints: [] }), target)
}

export function Controller(path?: string) {
  return (target: Function) => {
    const meta = getControllerMeta(target)
    meta.path = path
    ControllerContext.register(meta)

    // register it with typedi
    Service()(target)
  }
}

function getEndpointMeta(target: Function, propertyKey: string | symbol): EndpointMeta {
  const meta = getControllerMeta(target.constructor)
  const action = meta.endpoints.find(x => x.action === target[propertyKey])
  if (action) {
    return action
  }
  const newAction: EndpointMeta = {
    action: target[propertyKey],
    params: {},
  }
  meta.endpoints.push(newAction)
  return newAction
}

export function Route(method: HttpMethod, path = '/') {
  return (target: any, propertyKey: string | symbol) => {
    const meta = getEndpointMeta(target, propertyKey)
    meta.path = path
    meta.method = method
  }
}

export function Get(path = '/') {
  return (target: any, propertyKey: string | symbol) => {
    Route(HttpMethod.Get, path)(target, propertyKey)
  }
}

export function Post(path = '/') {
  return (target: any, propertyKey: string | symbol) => {
    Route(HttpMethod.Post, path)(target, propertyKey)
  }
}

export function Render(template: string) {
  return (target: any, propertyKey: string | symbol) => {
    const meta = getEndpointMeta(target, propertyKey)
    meta.template = template
  }
}

function addParam(src: ParamSource, key: string, target: any, propertyKey: string | symbol, index: number) {
  const meta = getEndpointMeta(target, propertyKey)
  const type = Reflect.getMetadata('design:paramtypes', target, propertyKey)[index]
  if ((src === ParamSource.Url || src === ParamSource.Query) && ![String, Number].includes(type)) {
    throw new Error(
      `unsupported ${src} param type ${target.constructor.name}.${meta.action.name}(${key}: ${type.name})`
    )
  }
  meta.params[key] = { src, type, index }
}

export function Param(key: string) {
  return (target: any, propertyKey: string | symbol, index: number) => {
    addParam(ParamSource.Url, key, target, propertyKey, index)
  }
}

export function Query(key: string) {
  return (target: any, propertyKey: string | symbol, index: number) => {
    addParam(ParamSource.Query, key, target, propertyKey, index)
  }
}

export function Body() {
  return (target: any, propertyKey: string | symbol, index: number) => {
    addParam(ParamSource.Body, 'body', target, propertyKey, index)
  }
}

export function Req() {
  return (target: any, propertyKey: string | symbol, index: number) => {
    addParam(ParamSource.Request, 'req', target, propertyKey, index)
  }
}

export function Res() {
  return (target: any, propertyKey: string | symbol, index: number) => {
    addParam(ParamSource.Response, 'res', target, propertyKey, index)
  }
}
