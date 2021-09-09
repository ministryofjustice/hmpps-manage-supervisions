import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { RedisConfig, ServerConfig, SessionConfig } from '../config'
import * as connectRedis from 'connect-redis'
import * as session from 'express-session'
import * as redis from 'redis'

export function useRedisSession(app: NestExpressApplication) {
  const config = app.get(ConfigService)
  const { domain } = config.get<ServerConfig>('server')
  const { expiryMinutes, secret } = config.get<SessionConfig>('session')
  const RedisStore = connectRedis(session)

  app.use(
    session({
      store: new RedisStore({
        client: redis.createClient({ ...config.get<RedisConfig>('redis') }),
      }),
      cookie: {
        secure: domain.protocol === 'https:',
        sameSite: 'lax',
        maxAge: expiryMinutes * 60 * 1000,
      },
      secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    }),
  )
}
