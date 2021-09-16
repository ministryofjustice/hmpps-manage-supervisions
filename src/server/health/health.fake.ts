import * as faker from 'faker'
import { HealthResult } from './health.types'
import { fake } from '../util/util.fake'

export const fakeHealthResult = fake<HealthResult>(() => ({
  healthy: true,
  checks: {
    hmppsAuth: 'OK',
    tokenVerification: 'OK',
    community: 'OK',
  },
  uptime: faker.datatype.float(1000),
  version: faker.git.shortSha(),
}))
