import { ILinksService, LinksHelper, LinksService } from './links.service'
import { BreadcrumbType, ResolveBreadcrumbOptions, Utm, UtmMedium, UtmSource } from './links.types'
import { BreadcrumbValue } from '../types'
import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common'
import * as flatten from 'flat'
import * as faker from 'faker'
import { fake, fakeEnum } from '../../util/util.fake'

class MockLinksService implements ILinksService {
  constructor(private readonly customUrls: Partial<Record<BreadcrumbType, string>> = {}) {}

  getUrl(type: BreadcrumbType, options: ResolveBreadcrumbOptions): string {
    if (type in this.customUrls) {
      return this.customUrls[type]
    }

    const queryString = Object.entries(flatten(options))
      .filter(([, v]) => v !== undefined)
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

export const fakeUtm = fake<Utm>(() => ({
  source: fakeEnum(UtmSource),
  medium: fakeEnum(UtmMedium),
  campaign: faker.company.bs(),
  content: { id: faker.datatype.uuid() },
}))
