import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../config'
import { camelCase } from 'lodash'
import { filters, NunjucksFilter } from './nunjucks/filters'
import { Request, Response } from 'express'

export function useGovUkUi(app: NestExpressApplication) {
  const { description, isProduction, staticResourceCacheDuration, supportEmail } = app
    .get(ConfigService)
    .get<ServerConfig>('server')
  const logger = new Logger('view-engine')

  app.setLocal('applicationName', description)
  app.setLocal('supportEmail', supportEmail)

  app.use((req: Request, res: Response, next: () => void) => {
    res.locals.notifications = []
    const success = req.flash('success')
    if (success?.length) {
      res.locals.notifications.push(...success.map(message => ({ message, level: 'success' })))
    }
    next()
  })

  const viewsPath = path.resolve(__dirname, 'views')
  const environment = nunjucks.configure([viewsPath], {
    express: app.getHttpAdapter().getInstance(),
    autoescape: true,
    noCache: !isProduction,
    watch: !isProduction,
  })

  const filterNames = []
  for (const Filter of Object.values(filters)) {
    const name = camelCase(Filter.name)
    filterNames.push(name)
    const filter: NunjucksFilter = new Filter(environment)
    environment.addFilter(name, (...args) => filter.filter(...args), filter.async)
  }

  logger.debug(`adding nunjucks filters ${filterNames.join(', ')}`)

  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: staticResourceCacheDuration * 1000,
  })
  app.setBaseViewsDir(viewsPath)
  app.setViewEngine('njk')
}
