import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../config'
import { camelCase } from 'lodash'
import * as filters from './nunjucks/filters'

export function useGovUkUi(app: NestExpressApplication) {
  const serverConfig = app.get(ConfigService).get<ServerConfig>('server')
  const logger = new Logger('view-engine')

  app.setLocal('asset_path', '/assets/')
  app.setLocal('applicationName', serverConfig.description)

  const environment = nunjucks.configure(
    [
      path.resolve(path.join(__dirname, 'views')),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      express: app.getHttpAdapter().getInstance(),
      autoescape: true,
      noCache: !serverConfig.isProduction,
      watch: !serverConfig.isProduction,
    },
  )

  for (const Filter of Object.values(filters)) {
    const name = camelCase(Filter.name)
    logger.log(`adding filter ${name}`)
    const filter: filters.NunjucksFilter = new Filter()
    environment.addFilter(name, filter.filter, filter.async)
  }

  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: serverConfig.staticResourceCacheDuration * 1000,
  })
  app.setBaseViewsDir(path.join(__dirname, 'views'))
  app.setViewEngine('njk')
}
