import 'source-map-support/register'
import './bootstrap/app-insights'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { upperCaseCrns, useBodyParser, useGovUkUi, useRedisSession, useTrustProxy } from './bootstrap'
import { ServerConfig } from './config'
import { Settings } from 'luxon'
import { LoggerModule } from './logger/logger.module'

Settings.defaultZone = 'Europe/London'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, bufferLogs: true })
  LoggerModule.useLogger(app)

  useBodyParser(app)
  useTrustProxy(app)
  useRedisSession(app)
  useGovUkUi(app)
  upperCaseCrns(app)

  const serverConfig = app.get(ConfigService).get<ServerConfig>('server')
  await app.listen(serverConfig.port)
  new Logger('bootstrap').log(`Listening on ${serverConfig.port}`)
}
bootstrap().catch(err => console.error('bootstrap failed ', err))
