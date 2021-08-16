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

      await next()

      const { statusCode } = res
      const meta = { method, url: originalUrl, statusCode, userAgent, ip }
      this.logger.log(`${method} ${originalUrl} => ${statusCode}`, meta)
    })
  }
}
