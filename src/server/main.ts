import 'source-map-support/register'
import './bootstrap/app-insights'
import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { useBodyParser, useGovUkUi, useRedisSession, useTrustProxy } from './bootstrap'
import { ServerConfig } from './config'
import { Settings } from 'luxon'

Settings.defaultZone = 'Europe/London'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })

  useBodyParser(app)
  useTrustProxy(app)
  useRedisSession(app)
  useGovUkUi(app)

  const logger = new Logger('bootstrap')
  const serverConfig = app.get(ConfigService).get<ServerConfig>('server')
  await app.listen(serverConfig.port)
  logger.log(`Listening on ${serverConfig.port}`)
}
bootstrap().catch(err => console.error('bootstrap failed ', err))
