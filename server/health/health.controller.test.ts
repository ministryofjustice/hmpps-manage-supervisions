import 'reflect-metadata'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { HealthService } from './health.service'
import { HealthController } from './health.controller'
import { HealthResult } from './types'
import { fakeHealthResult } from './health.fake'

describe('HealthController', () => {
  let service: SinonStubbedInstance<HealthService>
  let subject: HealthController
  let result: HealthResult

  beforeEach(() => {
    result = fakeHealthResult()
    service = createStubInstance(HealthService)
    service.getHealth.resolves(result)
    subject = new HealthController(service as any)
  })

  it('is getting health', async () => {
    const observed = await subject.get()
    expect(observed).toBe(result)
  })
})
