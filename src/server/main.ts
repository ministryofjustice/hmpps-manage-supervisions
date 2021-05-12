import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { useCsrf, useGovUkUi, useHelmet, usePassport, useRedisSession, useTrustProxy } from './bootstrap'
import { ServerConfig } from './config'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  useTrustProxy(app)
  useHelmet(app)
  useRedisSession(app)
  usePassport(app)
  useCsrf(app)
  useGovUkUi(app)

  const serverConfig = app.get(ConfigService).get<ServerConfig>('server')
  await app.listen(serverConfig.port)
  const logger = new Logger()
  logger.log(`Listening on ${serverConfig.port}`)
}
bootstrap().catch(err => console.error('bootstrap failed ', err))
