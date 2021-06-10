import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { RedisConfig, ServerConfig, SessionConfig } from '../config'
import * as connectRedis from 'connect-redis'
import * as session from 'express-session'
import * as redis from 'redis'

export function useRedisSession(app: NestExpressApplication) {
  const config = app.get(ConfigService)
  const serverConfig = config.get<ServerConfig>('server')
  const sessionConfig = config.get<SessionConfig>('session')
  const RedisStore = connectRedis(session)

  app.use(
    session({
      store: new RedisStore({
        client: redis.createClient({ ...config.get<RedisConfig>('redis') }),
      }),
      cookie: {
        secure: serverConfig.https,
        sameSite: 'lax',
      },
      secret: sessionConfig.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    }),
  )
}
