import { Injectable } from '@nestjs/common'
import { PATH_METADATA } from '@nestjs/common/constants'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import { BreadcrumbMeta, BreadcrumbType, ResolveBreadcrumbOptions } from './types'
import { BreadcrumbValue } from '../types'

interface PathToken {
  value?: string
  data?: string
}

function getRoute(root: string, path: string): PathToken[] {
  return [root, path]
    .filter(x => x)
    .map(x => x.split('/').filter(x => x))
    .reduce((x, y) => [...x, ...y], [])
    .map(x => {
      // match express path variables & strip any regex
      const match = x.match(/^:([^(]+)/)
      return match ? { data: match[1] } : { value: x }
    })
}

function resolveTitle(meta: BreadcrumbActionMeta, options: ResolveBreadcrumbOptions) {
  const title = typeof meta.title === 'function' ? meta.title(options) : meta.title
  if (!title) {
    throw new Error(`cannot resolve title for breadcrumb ${BreadcrumbType[meta.type]}`)
  }
  return title
}

function resolveUrl(meta: BreadcrumbActionMeta, options: ResolveBreadcrumbOptions): string {
  const resolved = meta.route.map(x => {
    if (x.value) {
      return x.value
    }
    const value = options[x.data]
    if (!value) {
      throw new Error(`cannot resolve ${BreadcrumbType[meta.type]} breadcrumb without ${x.data}`)
    }
    return value
  })

  return `/${resolved.join('/')}`
}

type BreadcrumbActionMeta = { route: PathToken[] } & BreadcrumbMeta

export interface ILinksService {
  of(options: ResolveBreadcrumbOptions): LinksHelper
  getUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions): string
  resolveAll(type: BreadcrumbType, options: ResolveBreadcrumbOptions): BreadcrumbValue[]
}

export class LinksHelper {
  constructor(private readonly service: ILinksService, private readonly options: ResolveBreadcrumbOptions) {}

  url(type: BreadcrumbType): string {
    return this.service.getUrl(type, this.options)
  }

  breadcrumbs(type: BreadcrumbType): BreadcrumbValue[] {
    return this.service.resolveAll(type, this.options)
  }
}

@Injectable()
export class LinksService implements ILinksService {
  private readonly actions: { [Key in BreadcrumbType]?: BreadcrumbActionMeta }

  constructor(discovery: DiscoveryService, metadataScanner: MetadataScanner, reflector: Reflector) {
    this.actions = discovery
      .getControllers()
      .map(controller => {
        const controllerPath = reflector.get(PATH_METADATA, controller.metatype)
        const methods = [...metadataScanner.getAllFilteredMethodNames(controller.metatype.prototype)]
        return methods
          .map(action => ({
            path: reflector.get(PATH_METADATA, controller.metatype.prototype[action]),
            breadcrumb: reflector.get<BreadcrumbMeta>('breadcrumb', controller.metatype.prototype[action]),
          }))
          .filter(x => x.path && x.breadcrumb)
          .map(x => ({ ...x.breadcrumb, route: getRoute(controllerPath, x.path) }))
      })
      .reduce((x, y) => [...x, ...y], [])
      .reduce((agg, x) => ({ ...agg, [x.type]: x }), {})
  }

  of(options: ResolveBreadcrumbOptions): LinksHelper {
    return new LinksHelper(this, options)
  }

  getUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions): string {
    return resolveUrl(this.getMeta(type), options)
  }

  resolveAll(type: BreadcrumbType, options: ResolveBreadcrumbOptions): BreadcrumbValue[] {
    let meta = this.getMeta(type)
    const result: BreadcrumbValue[] = [{ text: resolveTitle(meta, options) }] // the current breadcrumb has no link
    const visited = [type]

    while (meta.parent != undefined) {
      const parent = options.parentOverrides?.[meta.type] ?? meta.parent
      if (visited.includes(parent)) {
        throw new Error(`recursive breadcrumb ${[...visited, parent].map(x => BreadcrumbType[x]).join(' -> ')}`)
      }
      visited.push(parent)
      meta = this.getMeta(parent)
      result.unshift({
        text: resolveTitle(meta, options),
        href: resolveUrl(meta, options),
      })
    }

    return result
  }

  private getMeta(type: BreadcrumbType) {
    const meta = this.actions[type]
    if (!meta) {
      throw new Error(`no action registered for breadcrumb type ${BreadcrumbType[type]}`)
    }
    return meta
  }
}
