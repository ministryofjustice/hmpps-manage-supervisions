import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../config'
import { camelCase } from 'lodash'
import * as filters from './nunjucks/filters'

export function useGovUkUi(app: NestExpressApplication) {
  const { description, isProduction, staticResourceCacheDuration } = app.get(ConfigService).get<ServerConfig>('server')
  const logger = new Logger('view-engine')

  app.setLocal('applicationName', description)

  const viewsPath = path.resolve(__dirname, 'views')
  const environment = nunjucks.configure([viewsPath], {
    express: app.getHttpAdapter().getInstance(),
    autoescape: true,
    noCache: !isProduction,
    watch: !isProduction,
  })

  for (const Filter of Object.values(filters)) {
    const name = camelCase(Filter.name)
    logger.log(`adding filter ${name}`)
    const filter: filters.NunjucksFilter = new Filter()
    environment.addFilter(name, filter.filter, filter.async)
  }

  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: staticResourceCacheDuration * 1000,
  })
  app.setBaseViewsDir(viewsPath)
  app.setViewEngine('njk')
}
