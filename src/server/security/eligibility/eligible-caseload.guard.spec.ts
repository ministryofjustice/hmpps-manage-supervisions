import { EligibleCaseloadGuard } from './eligible-caseload.guard'
import { fakeUser } from '../user/user.fake'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { Reflector } from '@nestjs/core'
import { EligibilityService } from '../../community-api/eligibility'
import { ELIGIBLE_CASELOAD_KEY, EligibleCaseloadOnlyOptions } from './eligibility.types'
import { FAKE_CLASS, FAKE_HANDLER, fakeExecutionContext } from '../../util/nest.fake'

describe('EligibleCaseloadGuard', () => {
  let subject: EligibleCaseloadGuard
  let eligibilityService: SinonStubbedInstance<EligibilityService>

  const user = fakeUser()
  const context = fakeExecutionContext({
    request: { user, params: { crn: 'some-crn' } },
  })

  beforeAll(async () => {
    const reflector = createStubInstance(Reflector)
    eligibilityService = createStubInstance(EligibilityService)

    subject = new EligibleCaseloadGuard(reflector as any, eligibilityService as any)
    reflector.getAllAndOverride
      .withArgs(ELIGIBLE_CASELOAD_KEY, match.array.deepEquals([FAKE_HANDLER, FAKE_CLASS]))
      .returns({ crnParam: 'crn' } as EligibleCaseloadOnlyOptions)
  })

  it('succeeds for caseload offender', async () => {
    eligibilityService.isInEligibleCaseload.withArgs(user, 'some-crn').resolves(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('fails for non-caseload offender', async () => {
    eligibilityService.isInEligibleCaseload.withArgs(user, 'some-crn').resolves(false)
    await expect(subject.canActivate(context)).rejects.toThrowError(
      "offender with crn 'some-crn' is not on the caseload",
    )
  })
})
