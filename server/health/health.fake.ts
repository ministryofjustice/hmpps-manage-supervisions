import * as faker from 'faker'
import { merge } from 'lodash'
import { HealthResult } from './types'

export function fakeHealthResult(partial: DeepPartial<HealthResult> = {}): HealthResult {
  return merge(
    {
      healthy: true,
      checks: {
        hmppsAuth: 'OK',
        tokenVerification: 'OK',
        community: 'OK',
      },
      uptime: faker.datatype.float(1000),
      version: faker.git.shortSha(),
      build: {
        buildNumber: faker.git.shortSha(),
        gitRef: faker.git.commitSha(),
      },
    },
    partial,
  )
}
