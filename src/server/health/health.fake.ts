import * as faker from 'faker'
import { HealthResult } from './health.types'
import { fake, fakeEnum } from '../util/util.fake'
import {
  OpenApiVersion,
  OpenApiVersionReport,
  OpenApiVersionReportSummary,
} from './open-api-version/open-api-version.types'
import { DateTime } from 'luxon'

function fakeOpenApiVersion(): OpenApiVersion {
  return {
    date: DateTime.fromJSDate(faker.date.past()).startOf('day'),
    gitSha: faker.datatype.uuid(),
    buildNumber: faker.datatype.number(),
  }
}

export const fakeOpenApiVersionReport = fake<OpenApiVersionReport>(() => ({
  isError: faker.datatype.boolean(),
  local: fakeOpenApiVersion(),
  remote: fakeOpenApiVersion(),
  result: fakeEnum(OpenApiVersionReportSummary),
}))

export const fakeHealthResult = fake<HealthResult>(() => ({
  healthy: true,
  checks: {
    hmppsAuth: 'OK',
    tokenVerification: 'OK',
    community: 'OK',
  },
  uptime: faker.datatype.float(1000),
  version: faker.git.shortSha(),
  services: {
    community: fakeOpenApiVersionReport(),
    assessRisksAndNeeds: fakeOpenApiVersionReport(),
  },
}))
