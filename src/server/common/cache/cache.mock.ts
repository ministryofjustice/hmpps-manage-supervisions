import { CacheService, ICacheService, ValueFactory } from './cache.service'
import { DynamicModule, Module } from '@nestjs/common'

export class MockCacheService implements ICacheService {
  public readonly cache: Record<string, any> = {}

  async get<T>(key: string): Promise<T> {
    return this.cache[key] as T
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.cache[key] = value
  }

  async getOrSet<T>(key: string, factory: ValueFactory<T>): Promise<T> {
    if (this.cache[key]) {
      return this.cache[key]
    }
    const { value } = await factory()
    return (this.cache[key] = value)
  }
}

@Module({})
export class MockCacheModule {
  static register(): DynamicModule {
    return {
      module: MockCacheModule,
      providers: [MockCacheService, { provide: CacheService, useExisting: MockCacheService }],
      exports: [MockCacheService, CacheService],
    }
  }
}
