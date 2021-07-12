import { ILinksService, LinksService } from './links.service'
import { BreadcrumbType, ResolveBreadcrumbOptions } from './types'
import { BreadcrumbValue } from '../types'
import { Module } from '@nestjs/common'

export function fakeBreadcrumbUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions) {
  const queryString = Object.entries(options)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('&')

  return `/${BreadcrumbType[type]}?${queryString}`
}

export function fakeBreadcrumbs(type: BreadcrumbType, options: ResolveBreadcrumbOptions): BreadcrumbValue[] {
  return [
    {
      href: fakeBreadcrumbUrl(type, options),
      text: BreadcrumbType[type],
    },
  ]
}

export class MockLinksService implements ILinksService {
  getUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions): string {
    return fakeBreadcrumbUrl(type, options)
  }

  resolveAll(type: BreadcrumbType, options: ResolveBreadcrumbOptions): BreadcrumbValue[] {
    return fakeBreadcrumbs(type, options)
  }
}

@Module({
  providers: [MockLinksService, { provide: LinksService, useExisting: MockLinksService }],
  exports: [MockLinksService, LinksService],
})
export class MockLinksModule {}
