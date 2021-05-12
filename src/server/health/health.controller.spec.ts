import { Test } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { HealthService } from './health.service'
import { fakeHealthResult } from './health.fake'
import { of } from 'rxjs'
import { HealthException } from './types'

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
    service.getHealth.returns(of(result))
    const observed = await controller.get().toPromise()
    expect(observed).toBe(result)
  })

  it('should throw when unhealthy', async () => {
    const result = fakeHealthResult({ healthy: false })
    service.getHealth.returns(of(result))
    await expect(async () => controller.get().toPromise()).rejects.toThrow(new HealthException(result))
  })
})
