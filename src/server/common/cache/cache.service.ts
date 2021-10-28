import { Injectable, Logger } from '@nestjs/common'
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis'
import { ConfigService } from '@nestjs/config'
import { Config, RedisConfig } from '../../config'
import { SimpleCache } from '../../util/simple-cache'

export interface CacheSetOptions {
  durationSeconds?: number
}

export type ValueFactory<T> = () => Promise<{ value: T; options?: CacheSetOptions }>

export interface ICacheService {
  get<T>(key: string): Promise<T>
  set<T>(key: string, value: T, options: CacheSetOptions): Promise<void>
  getOrSet<T>(key: string, factory: ValueFactory<T>): Promise<T>
}

@Injectable()
export class CacheService implements ICacheService {
  private readonly client: WrappedNodeRedisClient
  private readonly logger = new Logger(CacheService.name)

  /**
   * a short lived local cache of promises that is used to prevent races for uncached data.
   */
  private readonly local = new SimpleCache<Promise<any>>({ useClones: false, stdTTL: 60, checkperiod: 60 })

  constructor(config: ConfigService<Config>) {
    this.client = createNodeRedisClient({ ...config.get<RedisConfig>('redis') })
    this.client.nodeRedis.on('error', error => {
      this.logger.error('redis error', error)
    })
  }

  async get<T>(key: string): Promise<T> {
    try {
      return JSON.parse(await this.client.get(key))
    } catch (err) {
      this.logger.error(`failed to get ${key}: ${err.message}`)
      return null
    }
  }

  async set<T>(key: string, value: T, { durationSeconds }: CacheSetOptions = {}): Promise<void> {
    try {
      const serial = JSON.stringify(value)
      if (durationSeconds !== undefined) {
        await this.client.set(key, serial, ['EX', durationSeconds])
      } else {
        await this.client.set(key, serial)
      }
    } catch (err) {
      this.logger.error(`failed to set ${key}: ${err.message}`)
    }
  }

  async getOrSet<T>(key: string, factory: ValueFactory<T>): Promise<T> {
    // check for locally cached promise first
    const cachedPromise = this.local.get(key)
    if (cachedPromise) {
      return cachedPromise
    }

    // otherwise check the remote cache.
    const cached = await this.get<T>(key)
    if (cached) {
      return cached
    }

    // create a new promise to fetch the uncached data & cache it then add this to the local promise cache
    // this means that multiple async callbacks asking for the same data will resolve the same promise from the cache
    // this prevents us from retrieving uncached data multiple times.
    const promise = factory().then(async ({ value, options }) => {
      await this.set(key, value, options)
      return value
    })
    this.local.set(key, promise)
    return promise
  }
}
