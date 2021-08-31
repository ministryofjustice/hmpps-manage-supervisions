import { ILinksService, LinksHelper, LinksService } from './links.service'
import { BreadcrumbType, ResolveBreadcrumbOptions } from './types'
import { BreadcrumbValue } from '../types'
import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common'

class MockLinksService implements ILinksService {
  constructor(private readonly customUrls: Partial<Record<BreadcrumbType, string>> = {}) {}

  getUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions): string {
    if (type in this.customUrls) {
      return this.customUrls[type]
    }

    const queryString = Object.entries(options)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('&')

    return `/${BreadcrumbType[type]}?${queryString}`
  }

  resolveAll(type: BreadcrumbType, options: ResolveBreadcrumbOptions): BreadcrumbValue[] {
    return [
      {
        href: this.getUrl(type, options),
        text: BreadcrumbType[type],
      },
    ]
  }

  of(options: ResolveBreadcrumbOptions): LinksHelper {
    return new LinksHelper(this, options)
  }
}

function getModuleMeta(useValue: MockLinksService): ModuleMetadata {
  return {
    providers: [{ provide: LinksService, useValue }],
    exports: [LinksService],
  }
}

const INSTANCE = new MockLinksService()

@Module(getModuleMeta(INSTANCE))
export class MockLinksModule {
  static register(customUrls: Partial<Record<BreadcrumbType, string>>): DynamicModule {
    return {
      module: MockLinksModule,
      ...getModuleMeta(new MockLinksService(customUrls)),
    }
  }

  static of(options: ResolveBreadcrumbOptions) {
    return INSTANCE.of(options)
  }
}
