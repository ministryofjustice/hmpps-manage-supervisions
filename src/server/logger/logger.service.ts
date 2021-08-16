import { Injectable, LoggerService as NestLoggerService, LogLevel as NestLogLevel } from '@nestjs/common'
import * as winston from 'winston'
import { ConfigService } from '@nestjs/config'
import { maxBy, isEmpty } from 'lodash'
import { Config, LogLevel, ServerConfig } from '../config'
import { LOGGER_HOOK } from './logger.hook'

function toWinstonLogLevel(level: NestLogLevel): LogLevel {
  switch (level) {
    case 'log':
      return LogLevel.Info
    case 'error':
      return LogLevel.Error
    case 'warn':
      return LogLevel.Warn
    case 'debug':
      return LogLevel.Debug
    case 'verbose':
      return LogLevel.Verbose
  }
}

export interface ContextualNestLoggerService extends NestLoggerService {
  of(context: string, options?: Record<string, any>): ContextualNestLoggerService

  child(options?: Record<string, any>): ContextualNestLoggerService
}

class NestWinstonWrapper implements ContextualNestLoggerService {
  constructor(private readonly logger: winston.Logger, private readonly currentContext: string) {}

  error(message: any, ...optionalParams: any[]) {
    this.wrap('error', message, optionalParams)
  }

  warn(message: any, ...optionalParams: any[]) {
    this.wrap('warn', message, optionalParams)
  }

  log(message: any, ...optionalParams: any[]) {
    this.wrap('log', message, optionalParams)
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.wrap('verbose', message, optionalParams)
  }

  debug(message: any, ...optionalParams: any[]) {
    this.wrap('debug', message, optionalParams)
  }

  setLogLevels(levels: NestLogLevel[]) {
    this.logger.level = maxBy(levels.map(toWinstonLogLevel), x => this.logger.levels[x])
  }

  of(context: string, options: Record<string, any> = {}) {
    return this.child({ ...options, context })
  }

  child({ context, ...options }: Record<string, any> = {}) {
    const nextContext = [this.currentContext, context].filter(x => x).join('|')
    return new NestWinstonWrapper(this.logger.child({ context: nextContext || undefined, ...options }), nextContext)
  }

  private wrap(nestLevel: NestLogLevel, message: any, args: any[] = []) {
    function addMeta(source: any) {
      const meta = args.find(x => typeof x === 'object')
      if (meta) {
        Object.assign(meta, source)
      } else {
        args.push(source)
      }
    }

    // The nest logger api implies that if the last argument is a string then it forms the logger context.
    // winston has no such concept so we set a context meta property & pick it up in the format.
    // We'll only do this for the root logger though (currentContext is falsey) otherwise we've already set context in default meta.
    if (!this.currentContext && args.length > 0 && typeof args[args.length - 1] === 'string') {
      addMeta({ context: args.pop() })
    }

    // add the user identifiers to the meta if available
    const store = LOGGER_HOOK.getStore()
    if (store) {
      addMeta({ ...store })
    }

    this.logger.log(toWinstonLogLevel(nestLevel), message, ...args)
  }
}

@Injectable()
export class LoggerService extends NestWinstonWrapper {
  private static rootLoggerFactory(config: ConfigService<Config>) {
    const { logLevel, isProduction } = config.get<ServerConfig>('server')
    const { colorize } = winston.format.colorize({ all: true })
    return winston.createLogger({
      level: logLevel,
      defaultMeta: {},
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.metadata(),
        winston.format.timestamp(),
        isProduction
          ? winston.format.json()
          : winston.format.printf(({ level, message, timestamp, metadata: { context = null, ...metadata } = {} }) =>
              [
                colorize(level, level),
                timestamp,
                context && `[${context}]`,
                !isEmpty(metadata) && JSON.stringify(metadata),
                message,
              ]
                .filter(x => x)
                .join(' '),
            ),
      ),
      transports: [new winston.transports.Console()],
    })
  }

  constructor(config: ConfigService<Config>) {
    super(LoggerService.rootLoggerFactory(config), null)
  }
}
