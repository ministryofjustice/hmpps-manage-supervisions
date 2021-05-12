import { Injectable, Logger } from '@nestjs/common'
import { ClassConstructor, ClassTransformOptions, deserialize, deserializeArray, serialize } from 'class-transformer'
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis'
import { ConfigService } from '@nestjs/config'
import { Config, RedisConfig } from '../../config'

export interface CacheSetOptions {
  durationSeconds?: number
}

export type ValueFactory<T = string> = () => Promise<{ value: T; options?: CacheSetOptions }>

export interface ICacheService {
  get(key: string): Promise<string>
  set(key: string, value: string, options: CacheSetOptions): Promise<void>
  getOrSet(key: string, factory: ValueFactory): Promise<string>
  getOrSetTransformed<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T>): Promise<T>
  getOrSetTransformedArray<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T[]>): Promise<T[]>
}

enum TransformModifier {
  Array = 'array',
}

@Injectable()
export class CacheService implements ICacheService {
  private readonly client: WrappedNodeRedisClient
  private readonly logger = new Logger()

  constructor(config: ConfigService<Config>) {
    this.client = createNodeRedisClient({ ...config.get<RedisConfig>('redis') })
    this.client.nodeRedis.on('error', error => {
      this.logger.error(`Redis error ${error}`)
    })
  }

  async get(key: string): Promise<string> {
    return this.client.get(key)
  }

  async set(key: string, value: string, { durationSeconds }: CacheSetOptions = {}): Promise<void> {
    if (durationSeconds !== undefined) {
      await this.client.set(key, value, ['EX', durationSeconds])
    } else {
      await this.client.set(key, value)
    }
  }

  async getOrSet(key: string, factory: ValueFactory): Promise<string> {
    const cached = await this.get(key)
    if (cached) {
      return cached
    }

    const { value, options } = await factory()
    await this.set(key, value, options)
    return value
  }

  getOrSetTransformed<T>(
    cls: ClassConstructor<T>,
    key: string,
    factory: ValueFactory<T[]>,
    modifier: TransformModifier.Array,
  ): Promise<T[]>
  getOrSetTransformed<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T>): Promise<T>
  async getOrSetTransformed<T>(
    cls: ClassConstructor<T>,
    key: string,
    factory: ValueFactory<T[]>,
    modifier?: TransformModifier,
  ): Promise<T | T[]> {
    const cached = await this.get(key)
    if (cached) {
      const transformOptions: ClassTransformOptions = { excludeExtraneousValues: true }
      return modifier === TransformModifier.Array
        ? deserializeArray(cls, cached, transformOptions)
        : deserialize(cls, cached, transformOptions)
    }

    const { value, options } = await factory()
    await this.set(key, serialize(value), options)
    return value
  }

  async getOrSetTransformedArray<T>(cls: ClassConstructor<T>, key: string, factory: ValueFactory<T[]>): Promise<T[]> {
    return this.getOrSetTransformed(cls, key, factory, TransformModifier.Array)
  }
}
