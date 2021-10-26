import { Test } from '@nestjs/testing'
import { EligibilityService, OffenderEligibilityResult } from './eligibility.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api.mock'
import { CommunityApiService } from '../community-api.service'
import { match } from 'sinon'
import { fakeOkResponse, fakeRestError } from '../../common/rest/rest.fake'
import { fakePaginated, fakeStaffCaseloadEntry } from '../community-api.fake'
import { fakeCase } from '../../cases/cases.fake'
import { fakeUser } from '../../security/user/user.fake'
import { HttpStatus } from '@nestjs/common'

describe('EligibilityService', () => {
  let subject: EligibilityService
  let user: User
  let community: MockCommunityApiService

  beforeAll(async () => {
    user = fakeUser({ username: 'some-username' })
    const module = await Test.createTestingModule({
      providers: [EligibilityService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(EligibilityService)
    community = module.get(CommunityApiService)
  })

  describe('is on eligible caseload', () => {
    beforeAll(() => {
      community.staff.getManageSupervisionsEligibleOffendersUsingGET
        .withArgs(match({ username: 'some-username', unpaged: true }))
        .resolves(fakeOkResponse(fakePaginated([fakeCase({ crn: 'some-crn' })])))
    })

    it('succeeds for eligible caseload offender', async () => {
      const result = await subject.isInEligibleCaseload(user, 'some-crn')
      expect(result).toBe(true)
    })

    it('fails for ineligible or non-caseload offender', async () => {
      const result = await subject.isInEligibleCaseload(user, 'some-other-crn')
      expect(result).toBe(false)
    })
  })

  describe('check offender eligibility', () => {
    it('is eligible from session', async () => {
      const session = Object.freeze({ eligibility: { 'some-crn': true } })
      const observed = await subject.checkOffenderEligibility(session as any, 'some-crn')
      expect(observed).toBe(OffenderEligibilityResult.Eligible)
    })

    it('is ineligible from session', async () => {
      const session = Object.freeze({ eligibility: { 'some-crn': false } })
      const observed = await subject.checkOffenderEligibility(session as any, 'some-crn')
      expect(observed).toBe(OffenderEligibilityResult.Ineligible)
    })

    it('is eligible from api', async () => {
      community.offender.getManageSupervisionsEligibilityUsingGET
        .withArgs(match({ crn: 'some-crn' }))
        .resolves(fakeOkResponse(fakeStaffCaseloadEntry()))
      const session: any = {}
      const observed = await subject.checkOffenderEligibility(session as any, 'some-crn')
      expect(observed).toBe(OffenderEligibilityResult.Eligible)
      expect(session).toEqual({ eligibility: { 'some-crn': true } })
    })

    it('is ineligible from api', async () => {
      community.offender.getManageSupervisionsEligibilityUsingGET
        .withArgs(match({ crn: 'some-crn' }))
        .throws(fakeRestError(HttpStatus.NOT_FOUND))
      const session: any = {}
      const observed = await subject.checkOffenderEligibility(session as any, 'some-crn')
      expect(observed).toBe(OffenderEligibilityResult.IneligibleDisplayWarning)
      expect(session).toEqual({ eligibility: { 'some-crn': false } })
    })
  })
})
