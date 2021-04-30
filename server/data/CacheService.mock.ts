import { ICacheService, ValueFactory } from './CacheService'

export class MockCacheService implements ICacheService {
  public readonly cache: Record<string, any> = {}

  async get(key: string): Promise<string> {
    return this.cache[key]
  }

  async set(key: string, value: string): Promise<void> {
    this.cache[key] = value
  }

  async getOrSet(key: string, factory: ValueFactory): Promise<string> {
    if (this.cache[key]) {
      return this.cache[key]
    }
    const { value } = await factory()
    return (this.cache[key] = value)
  }
}
