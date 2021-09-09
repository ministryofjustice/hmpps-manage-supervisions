import { Global, MiddlewareConsumer, Module } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { LoggerMiddleware } from './logger.middleware'
import { NestExpressApplication } from '@nestjs/platform-express'

/**
 * Global logger module.
 * Register this once into the app module only.
 *
 * This provides across all wired up modules:
 * * LoggerService: Nestjs wrapper for the winston library.
 * * LoggerMiddleware: logs request url & response status.
 * Note: async local storage is used to log user data so this should be registered after authentication.
 *
 * You can wither consume this service through the nest api i.e.
 *
 * import { Logger } from '@nestjs/common'
 * const logger = new Logger('LoggerName')
 *
 * or just inject LoggerService and name a child logger with logger.of('LoggerName').
 * for testing in this case, MockLoggerModule should be wired up.
 *
 * The nest logger API is a bit looser than winston so ensure that:
 * - always log errors => logger.error('something bad happened', err)
 * - provide meta separately, but only a maximum of one meta object => logger.log('some expected happened', { some: 'property' })
 * - you cannot log errors and meta at the same time => logger.error('the meta here will be ignored', err, { thisIs: 'not logged' })
 *   instead set properties on the logged error object
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).exclude('/health', '/health/ping').forRoutes('*')
  }

  static useLogger(app: NestExpressApplication) {
    const logger = app.get(LoggerService)
    app.useLogger(logger)
  }
}
