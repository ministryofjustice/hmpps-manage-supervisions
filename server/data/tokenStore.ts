import redis from 'redis'
import { promisify } from 'util'

import logger from '../../logger'
import { ConfigService } from '../config'

const config = ConfigService.INSTANCE

const createRedisClient = () => {
  return redis.createClient({
    ...config.redis,
    prefix: 'systemToken:',
  })
}

export default class TokenStore {
  private getRedisAsync: (key: string) => Promise<string>

  private setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  constructor(redisClient: redis.RedisClient = createRedisClient()) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    this.setRedisAsync(key, token, 'EX', durationSeconds)
  }

  public async getToken(key: string): Promise<string> {
    return this.getRedisAsync(key)
  }
}
