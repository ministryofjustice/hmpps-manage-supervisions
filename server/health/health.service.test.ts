import * as sinon from 'sinon'
import { pick } from 'lodash'
import { HealthClient, ServiceHealthResult } from './health.client'
import { HealthService } from './health.service'
import { fakeConfig } from '../config/config.fake'
import { HealthException } from '../mvc'

describe('HealthService', () => {
  let subject: HealthService
  let serviceCheck: ServiceHealthResult

  beforeEach(() => {
    const client = sinon.createStubInstance(HealthClient)
    const config = fakeConfig({
      apis: {
        hmppsAuth: { enabled: true },
        community: { enabled: false },
        tokenVerification: { enabled: false },
      },
    })

    client.serviceCheckFactory.withArgs('hmppsAuth', config.apis.hmppsAuth).returns(() => Promise.resolve(serviceCheck))

    subject = new HealthService(client, config)
  })

  it('is healthy', async () => {
    serviceCheck = {
      healthy: true,
      name: 'hmppsAuth',
      result: 'OK',
    }
    const result = await subject.getHealth()
    expect(pick(result, ['healthy', 'checks'])).toEqual({ healthy: true, checks: { hmppsAuth: 'OK' } })
  })

  it('is unhealthy', async () => {
    serviceCheck = {
      healthy: false,
      name: 'hmppsAuth',
      result: new Error('server error'),
    }
    await expect(subject.getHealth()).rejects.toThrow(HealthException)
  })
})
