import { CaseloadGuard } from './caseload.guard'
import { mockCommunityApiService, MockCommunityApiService } from '../../community-api/community-api.mock'
import { fakeUser } from '../user/user.fake'
import { createStubInstance, match } from 'sinon'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { fakePaginated } from '../../community-api/community-api.fake'
import { fakeCase } from '../../cases/cases.fake'
import { Reflector } from '@nestjs/core'
import { CASELOAD_KEY, CaseloadGuardOptions } from './caseload-only.decorator'

const handler = 'handler'
const cls = 'cls'

describe('CaseloadGuard', () => {
  let subject: CaseloadGuard
  let community: MockCommunityApiService
  let user: User
  const context: any = {
    switchToHttp: () => ({
      getRequest: () => ({ user, params: { crn: 'some-crn' } }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  }

  beforeEach(async () => {
    user = fakeUser({ username: 'some-username' })
    community = mockCommunityApiService()
    const reflector = createStubInstance(Reflector)

    subject = new CaseloadGuard(reflector as any, community as any)
    reflector.getAllAndOverride
      .withArgs(CASELOAD_KEY, match.array.deepEquals([handler, cls]))
      .returns({ crnParam: 'crn' } as CaseloadGuardOptions)
  })

  it('succeeds for caseload offender', async () => {
    community.staff.getCasesUsingGET
      .withArgs(match({ username: 'some-username', unpaged: true }))
      .resolves(fakeOkResponse(fakePaginated([fakeCase({ crn: 'some-crn' })])))

    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('fails for non-caseload offender', async () => {
    community.staff.getCasesUsingGET
      .withArgs(match({ username: 'some-username', unpaged: true }))
      .resolves(fakeOkResponse(fakePaginated([fakeCase({ crn: 'some-other-crn' })])))

    await expect(subject.canActivate(context)).rejects.toThrowError(
      "offender with crn 'some-crn' is not on the caseload for user 'some-username'",
    )
  })
})
