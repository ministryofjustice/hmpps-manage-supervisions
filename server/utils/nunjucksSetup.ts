import nunjucks from 'nunjucks'
import express from 'express'
import * as path from 'path'
import { DateTime } from 'luxon'

export default function nunjucksSetup(app: express.Application): void {
  nunjucks
    .configure(
      [
        path.resolve(path.join(__dirname, '..', 'views')),
        'node_modules/govuk-frontend/',
        'node_modules/govuk-frontend/components/',
        'node_modules/@ministryofjustice/frontend/',
        'node_modules/@ministryofjustice/frontend/moj/components/',
      ],
      {
        autoescape: true,
        express: app,
      },
    )
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
}
