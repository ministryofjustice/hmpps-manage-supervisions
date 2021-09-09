import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../config'

export function useSentry(app: NestExpressApplication) {
  const { deploymentEnvironment, version, name } = app.get(ConfigService).get<ServerConfig>('server')
  // dsn should be set through environment variable SENTRY_DSN, otherwise sentry wil be disabled
  Sentry.init({
    environment: deploymentEnvironment,
    release: `${name}@${version}`,
    tracesSampler({ request }) {
      return !request.url.startsWith('/health') && !request.url.startsWith('/assets')
    },
  })
  app.use(Sentry.Handlers.requestHandler())
}
