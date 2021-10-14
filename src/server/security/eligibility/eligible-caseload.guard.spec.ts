import { EligibleCaseloadGuard } from './eligible-caseload.guard'
import { fakeUser } from '../user/user.fake'
import { createStubInstance, match, SinonStubbedInstance } from 'sinon'
import { Reflector } from '@nestjs/core'
import { EligibilityService } from '../../community-api/eligibility'
import { ELIGIBLE_CASELOAD_KEY, EligibleCaseloadOnlyOptions } from './eligibility.types'

const handler = 'handler'
const cls = 'cls'

describe('EligibleCaseloadGuard', () => {
  let subject: EligibleCaseloadGuard
  let eligibilityService: SinonStubbedInstance<EligibilityService>

  const user = fakeUser()
  const context: any = {
    switchToHttp: () => ({
      getRequest: () => ({ user, params: { crn: 'some-crn' } }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  }

  beforeAll(async () => {
    const reflector = createStubInstance(Reflector)
    eligibilityService = createStubInstance(EligibilityService)

    subject = new EligibleCaseloadGuard(reflector as any, eligibilityService as any)
    reflector.getAllAndOverride
      .withArgs(ELIGIBLE_CASELOAD_KEY, match.array.deepEquals([handler, cls]))
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
