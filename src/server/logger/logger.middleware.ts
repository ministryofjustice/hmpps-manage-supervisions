import { Injectable, NestMiddleware } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { LOGGER_HOOK } from './logger.hook'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: any, res: any, next: () => void) {
    return LOGGER_HOOK.run({ user: req.user?.uuid || null }, async () => {
      const { ip, method, originalUrl } = req
      const userAgent = req.get('user-agent') || ''

      res.on('finish', () => {
        const { statusCode } = res

        // we have to set the user here as the async hook doesnt get resolved in this callback.
        const meta = { method, url: originalUrl, statusCode, userAgent, ip, user: req.user?.uuid }
        this.logger.log(`${method} ${originalUrl} => ${statusCode}`, meta)
      })

      // since we're wrapping all middleware, including nest in this logger async hook, all will have access to the user
      next()
    })
  }
}
