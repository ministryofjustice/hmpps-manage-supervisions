import { Injectable, Logger, NestMiddleware } from '@nestjs/common'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('http')

  use(req: any, res: any, next: () => void) {
    const { ip, method, originalUrl } = req
    const userAgent = req.get('user-agent') || ''

    res.on('finish', () => {
      const { statusCode } = res
      const message = { method, url: originalUrl, statusCode, userAgent, ip }
      this.logger.log(JSON.stringify(message))
    })
    next()
  }
}
