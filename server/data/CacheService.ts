import { Service } from 'typedi'
import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis'
import { ConfigService } from '../config'
import logger from '../../logger'

export interface CacheSetOptions {
  durationSeconds?: number
}

export type ValueFactory = () => Promise<{ value: string; options: CacheSetOptions }>

export interface ICacheService {
  get(key: string): Promise<string>
  set(key: string, value: string, options: CacheSetOptions): Promise<void>
  getOrSet(key: string, factory: ValueFactory): Promise<string>
}

@Service({ global: true })
export class CacheService implements ICacheService {
  private readonly client: WrappedNodeRedisClient

  constructor(config: ConfigService) {
    this.client = createNodeRedisClient({ ...config.redis })
    this.client.nodeRedis.on('error', error => {
      logger.error(error, 'Redis error')
    })
  }

  async get(key: string): Promise<string> {
    return this.client.get(key)
  }

  async set(key: string, value: string, { durationSeconds }: CacheSetOptions): Promise<void> {
    if (durationSeconds !== undefined) {
      await this.client.set(key, value, ['EX', durationSeconds])
    } else {
      await this.client.set(key, value)
    }
  }

  async getOrSet(key: string, factory: ValueFactory): Promise<string> {
    const cached = await this.get(key)
    if (cached !== undefined) {
      return cached
    }

    const { value, options } = await factory()
    await this.set(key, value, options)
    return value
  }
}
