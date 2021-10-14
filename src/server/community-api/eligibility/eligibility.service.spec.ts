import { Test } from '@nestjs/testing'
import { EligibilityService } from './eligibility.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api.mock'
import { CommunityApiService } from '../community-api.service'
import { match } from 'sinon'
import { fakeOkResponse, fakeRestError } from '../../common/rest/rest.fake'
import { fakePaginated, fakeStaffCaseloadEntry } from '../community-api.fake'
import { fakeCase } from '../../cases/cases.fake'
import { fakeUser } from '../../security/user/user.fake'
import { HttpStatus } from '@nestjs/common'
import { LocalSessionData } from '../../@types/express-session'

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

  describe('is eligible offender', () => {
    it('succeeds for eligible offender', async () => {
      community.offender.getManageSupervisionsEligibilityUsingGET
        .withArgs(match({ crn: 'some-crn' }))
        .resolves(fakeOkResponse(fakeStaffCaseloadEntry()))
      const result = await subject.isEligibleOffender('some-crn')
      expect(result).toBe(true)
    })

    it('fails for ineligible offender', async () => {
      community.offender.getManageSupervisionsEligibilityUsingGET
        .withArgs(match({ crn: 'some-other-crn' }))
        .throws(fakeRestError(HttpStatus.NOT_FOUND))
      const result = await subject.isEligibleOffender('some-other-crn')
      expect(result).toBe(false)
    })
  })

  describe('should display eligibility warning', () => {
    it('sets displayed crn when session empty', () => {
      const session: LocalSessionData = {}
      const observed = subject.shouldDisplayEligibilityWarning(session as any, 'some-crn')
      expect(observed).toBe(true)
      expect(session).toEqual({ eligibility: { warningDisplayed: ['some-crn'] } } as LocalSessionData)
    })

    it('sets displayed crn when not displayed', () => {
      const session: LocalSessionData = { eligibility: { warningDisplayed: ['some-other-crn'] } }
      const observed = subject.shouldDisplayEligibilityWarning(session as any, 'some-crn')
      expect(observed).toBe(true)
      expect(session).toEqual({ eligibility: { warningDisplayed: ['some-other-crn', 'some-crn'] } } as LocalSessionData)
    })

    it('has no side effects when already displayed', () => {
      const session: LocalSessionData = { eligibility: { warningDisplayed: ['some-crn'] } }
      const observed = subject.shouldDisplayEligibilityWarning(session as any, 'some-crn')
      expect(observed).toBe(false)
      expect(session).toEqual({ eligibility: { warningDisplayed: ['some-crn'] } } as LocalSessionData)
    })
  })
})
