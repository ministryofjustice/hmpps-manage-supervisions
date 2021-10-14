import { CheckEligibilityInterceptor } from './check-eligibility.interceptor'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { Reflector } from '@nestjs/core'
import { EligibilityService } from '../../community-api/eligibility'

describe('CheckEligibilityInterceptor', () => {
  let subject: CheckEligibilityInterceptor
  let eligibilityService: SinonStubbedInstance<EligibilityService>

  beforeAll(() => {
    const reflector = createStubInstance(Reflector)
    eligibilityService = createStubInstance(EligibilityService)
    subject = new CheckEligibilityInterceptor(reflector as any, eligibilityService as any)
  })

  it('should be defined', () => {
    expect(subject).toBeDefined()
  })
})
