import { ICacheService, ValueFactory } from './CacheService'
import { ClassConstructor } from 'class-transformer/types/interfaces'
import { ClassTransformOptions, deserialize, deserializeArray, serialize } from 'class-transformer'

export class MockCacheService implements ICacheService {
  public readonly cache: Record<string, string> = {}

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

  async getOrSetTransformed<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T>): Promise<T> {
    const cached = await this.get(key)
    if (cached) {
      const transformOptions: ClassTransformOptions = { excludeExtraneousValues: true }
      return deserialize(cls, cached, transformOptions)
    }

    const { value } = await factory()
    await this.set(key, serialize(value))
    return value
  }

  async getOrSetTransformedArray<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T[]>): Promise<T[]> {
    const cached = await this.get(key)
    if (cached) {
      const transformOptions: ClassTransformOptions = { excludeExtraneousValues: true }
      return deserializeArray(cls, cached, transformOptions)
    }

    const { value } = await factory()
    await this.set(key, serialize(value))
    return value
  }
}
