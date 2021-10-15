import { NestExpressApplication } from '@nestjs/platform-express'
import * as express from 'express'
import { CrnRewriteInterceptor } from '../common/crn-rewrite/crn-rewrite.interceptor'

export function useBodyParser(app: NestExpressApplication) {
  // nest still uses body-parser but this doesnt play nice with some other libraries, so let's disable it and replace.
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
}

export function useTrustProxy(app: NestExpressApplication) {
  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)
}

export function upperCaseCrns(app: NestExpressApplication) {
  app.useGlobalInterceptors(new CrnRewriteInterceptor())
}
