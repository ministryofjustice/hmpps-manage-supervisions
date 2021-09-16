import { Test } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { HealthService } from './health.service'
import { fakeHealthResult } from './health.fake'
import { HealthException } from './health.types'

describe('HealthController', () => {
  let controller: HealthController
  let service: SinonStubbedInstance<HealthService>

  beforeEach(async () => {
    service = createStubInstance(HealthService)
    const module = await Test.createTestingModule({
      providers: [{ provide: HealthService, useValue: service }],
      controllers: [HealthController],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should not throw when healthy', async () => {
    const result = fakeHealthResult({ healthy: true })
    service.getHealth.resolves(result)
    const observed = await controller.get()
    expect(observed).toBe(result)
  })

  it('should throw when unhealthy', async () => {
    const result = fakeHealthResult({ healthy: false })
    service.getHealth.resolves(result)
    await expect(async () => controller.get()).rejects.toThrow(new HealthException(result))
  })
})
