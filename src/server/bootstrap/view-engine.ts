import { NestExpressApplication } from '@nestjs/platform-express'
import * as nunjucks from 'nunjucks'
import * as path from 'path'
import { ConfigService } from '@nestjs/config'
import { ServerConfig } from '../config'
import { DateTime } from 'luxon'
import { get } from 'lodash'

export function useGovUkUi(app: NestExpressApplication) {
  const serverConfig = app.get(ConfigService).get<ServerConfig>('server')

  app.setLocal('asset_path', '/assets/')
  app.setLocal('applicationName', serverConfig.description)

  nunjucks
    .configure(
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
    // TODO modularise these filters
    .addFilter('initialiseName', (fullName: string) => {
      if (!fullName) {
        return null
      }
      const [[initial], ...rest] = fullName.split(' ')
      return `${initial}. ${rest.slice(-1)}`
    })
    .addFilter('toIsoDate', (date: DateTime) => date.toISODate())
    .addFilter('dateFormat', (value: string | DateTime, format: string) => {
      const date = value instanceof DateTime ? value : DateTime.fromISO(value)
      return date.toFormat(format)
    })
    .addFilter('toOptionList', (arr: any[], value: any, valuePath: string, textPath: string) => {
      return arr.map(x => ({
        text: get(x, textPath),
        value: get(x, valuePath),
        checked: value && get(x, valuePath) === value,
      }))
    })

  app.useStaticAssets(path.join(__dirname, 'assets'), {
    prefix: '/assets',
    maxAge: serverConfig.staticResourceCacheDuration * 1000,
  })
  app.setBaseViewsDir(path.join(__dirname, 'views'))
  app.setViewEngine('njk')
}
