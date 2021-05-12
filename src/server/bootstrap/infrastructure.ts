import { NestExpressApplication } from '@nestjs/platform-express'

export function useTrustProxy(app: NestExpressApplication) {
  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)
}
