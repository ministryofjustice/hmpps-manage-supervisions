import { CheckEligibilityInterceptor } from './check-eligibility.interceptor'
import { createStubInstance, match } from 'sinon'
import { Reflector } from '@nestjs/core'
import { EligibilityService, OffenderEligibilityResult } from '../../community-api/eligibility'
import { FAKE_CLASS, FAKE_HANDLER, fakeCallHandler, fakeExecutionContext } from '../../util/nest.fake'
import { firstValueFrom } from 'rxjs'
import { CHECK_ELIGIBILITY_KEY, CheckEligibilityContext, IneligibilityCaseWarningRequired } from './eligibility.types'
import { BreadcrumbType } from '../../common/links'

describe('CheckEligibilityInterceptor', () => {
  let subject: CheckEligibilityInterceptor
  const eligibilityService = createStubInstance(EligibilityService)
  const session: any = {}
  const context = fakeExecutionContext({ request: { params: { crn: 'some-crn' }, session } })

  beforeAll(() => {
    const reflector = createStubInstance(Reflector)
    reflector.getAllAndOverride
      .withArgs(CHECK_ELIGIBILITY_KEY, match.array.deepEquals([FAKE_HANDLER, FAKE_CLASS]))
      .returns({ page: BreadcrumbType.Case, options: { crnParam: 'crn' } } as CheckEligibilityContext)
    subject = new CheckEligibilityInterceptor(reflector as any, eligibilityService as any)
  })

  function havingEligibility(result: OffenderEligibilityResult) {
    eligibilityService.checkOffenderEligibility.withArgs(session, 'some-crn').resolves(result)
  }

  async function whenInterceptingEligibility() {
    const handler = fakeCallHandler({ someOther: 'property' })
    const observable = await subject.intercept(context, handler)
    return await firstValueFrom(observable)
  }

  it('is eligible', async () => {
    havingEligibility(OffenderEligibilityResult.Eligible)
    const observed = await whenInterceptingEligibility()
    expect(observed).toEqual({ someOther: 'property', caseEligibility: true })
  })

  it('is ineligible', async () => {
    havingEligibility(OffenderEligibilityResult.Ineligible)
    const observed = await whenInterceptingEligibility()
    expect(observed).toEqual({ someOther: 'property', caseEligibility: false })
  })

  it('is ineligible with warning', async () => {
    havingEligibility(OffenderEligibilityResult.IneligibleDisplayWarning)
    await expect(whenInterceptingEligibility).rejects.toThrow(IneligibilityCaseWarningRequired)
  })
})
