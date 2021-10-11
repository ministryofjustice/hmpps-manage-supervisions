import { Injectable, NestMiddleware, LoggerService as NestLoggerService } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { LOGGER_HOOK } from './logger.hook'
import { Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: NestLoggerService

  constructor(logger: LoggerService) {
    this.logger = logger.of('http-request')
  }

  use(req: Request, res: Response, next: () => void) {
    const user = (req.user as User)?.uuid || null
    return LOGGER_HOOK.run({ user }, async () => {
      const { ip, method, originalUrl } = req
      const userAgent = req.get('user-agent') || null

      res.on('finish', () => {
        const { statusCode } = res

        // we have to set the user here as the async hook doesnt get resolved in this callback.
        const meta = { user, method, url: originalUrl, statusCode, userAgent, ip }
        const logLevel = statusCode < 400 ? 'log' : 'warn'
        this.logger[logLevel](`${method} ${originalUrl} => ${statusCode}`, meta)
      })

      // since we're wrapping all middleware, including nest in this logger async hook, all will have access to the user
      next()
    })
  }
}
