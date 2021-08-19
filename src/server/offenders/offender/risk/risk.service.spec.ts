import { Test } from '@nestjs/testing'
import { AssessRisksAndNeedsApiService, RiskDtoCurrent, RiskDtoPrevious } from '../../../assess-risks-and-needs-api'
import { fakeOkResponse, fakeRestError } from '../../../common/rest/rest.fake'
import { Risks } from './risk.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { RiskService } from './risk.service'
import {
  MockAssessRisksAndNeedsApiModule,
  MockAssessRisksAndNeedsApiService,
} from '../../../assess-risks-and-needs-api/assess-risks-and-needs-api.mock'
import { CommunityApiService } from '../../../community-api'
import { fakeAllRoshRiskDto } from '../../../assess-risks-and-needs-api/assess-risks-and-needs-api.fake'
import { fakeRegistration } from '../../../community-api/community-api.fake'
import { FakeConfigModule } from '../../../config/config.fake'
import { HttpStatus } from '@nestjs/common'

const IGNORED_REGISTRATION = 'some-ignored-registration-type'

describe('RiskService', () => {
  let subject: RiskService
  let community: MockCommunityApiService
  let arn: MockAssessRisksAndNeedsApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RiskService],
      imports: [
        MockCommunityApiModule.register(),
        MockAssessRisksAndNeedsApiModule.register(),
        FakeConfigModule.register({ risk: { ignoredRegistrationTypes: [IGNORED_REGISTRATION] } }),
      ],
    }).compile()

    subject = module.get(RiskService)
    community = module.get(CommunityApiService)
    arn = module.get(AssessRisksAndNeedsApiService)
  })

  describe('getting risks', () => {
    it('gets risks', async () => {
      const risks = fakeAllRoshRiskDto({
        riskToSelf: {
          suicide: {
            previous: RiskDtoPrevious.No,
            previousConcernsText: null,
            current: RiskDtoCurrent.Yes,
            currentConcernsText: 'Some current concerns',
          },
          selfHarm: {
            previous: RiskDtoPrevious.Yes,
            previousConcernsText: null,
            current: RiskDtoCurrent.Yes,
            currentConcernsText: 'Some ignored current concerns',
          },
          custody: {
            previous: RiskDtoPrevious.Yes,
            previousConcernsText: 'Some previous concerns',
            current: RiskDtoCurrent.No,
            currentConcernsText: null,
          },
          hostelSetting: {
            previous: RiskDtoPrevious.No,
            previousConcernsText: null,
            current: RiskDtoCurrent.No,
            currentConcernsText: null,
          },
          vulnerability: {
            previous: RiskDtoPrevious.No,
            previousConcernsText: null,
            current: RiskDtoCurrent.No,
            currentConcernsText: null,
          },
        },
        summary: {
          whoIsAtRisk: 'Someone at risk',
          natureOfRisk: 'Some nature of risk',
          riskImminence: 'Some risk imminence',
          riskInCommunity: {
            VERY_HIGH: ['Children', 'Staff'],
            HIGH: ['Public'],
            LOW: ['Known Adult'],
          },
        },
      })

      const stub = arn.risk.getRoshRisksByCrn.resolves(fakeOkResponse(risks))
      const observed = await subject.getRisks('some-crn')

      expect(observed).toEqual({
        community: {
          level: { class: 'app-tag--dark-red', index: 3, text: 'Very high' },
          riskLevels: { HIGH: ['Public'], LOW: ['Known Adult'], VERY_HIGH: ['Children', 'Staff'] },
          risks: [
            {
              level: 'VERY_HIGH',
              meta: { class: 'app-tag--dark-red', index: 3, text: 'Very high' },
              riskTo: 'Children',
            },
            { level: 'VERY_HIGH', meta: { class: 'app-tag--dark-red', index: 3, text: 'Very high' }, riskTo: 'Staff' },
            {
              level: 'HIGH',
              meta: { class: 'govuk-tag--red', index: 2, text: 'High' },
              riskTo: 'Public',
            },
            {
              level: 'LOW',
              meta: { class: 'govuk-tag--green', index: 0, text: 'Low' },
              riskTo: 'Known Adult',
            },
          ],
          natureOfRisk: 'Some nature of risk',
          riskImminence: 'Some risk imminence',
          whoIsAtRisk: 'Someone at risk',
        },
        self: {
          harm: {
            notes: { current: 'Some current concerns', previous: null },
            value: 'There are concerns about self-harm and suicide',
          },
          custody: {
            notes: { current: null, previous: 'Some previous concerns' },
            value: 'There were concerns about coping in custody',
          },
          vulnerability: {
            notes: { current: null, previous: null },
            value: null,
          },
        },
      } as Risks)
      expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
    })

    it('handles missing offender', async () => {
      arn.risk.getRoshRisksByCrn.throws(fakeRestError(HttpStatus.NOT_FOUND))
      const observed = await subject.getRisks('some-crn')
      expect(observed).toBeNull()
    })

    it('handles missing risk data', async () => {
      const risks = fakeAllRoshRiskDto({
        riskToSelf: null,
        summary: { riskInCommunity: null, natureOfRisk: null, riskImminence: null, whoIsAtRisk: null },
      })
      arn.risk.getRoshRisksByCrn.resolves(fakeOkResponse(risks))
      const observed = await subject.getRisks('some-crn')
      expect(observed).toEqual({
        community: {
          level: null,
          natureOfRisk: null,
          riskImminence: null,
          whoIsAtRisk: null,
          risks: [],
          riskLevels: {},
        },
        self: {
          custody: { notes: { current: null, previous: null }, value: null },
          harm: { notes: { current: null, previous: null }, value: null },
          vulnerability: { notes: { current: null, previous: null }, value: null },
        },
      } as Risks)
    })
  })

  describe('getting risk registrations', () => {
    it('gets risk registrations', async () => {
      const registrations = [
        fakeRegistration({ type: { description: 'Beta' }, riskColour: 'White' }),
        fakeRegistration({ type: { description: 'Alpha' }, riskColour: 'Amber' }),
      ]

      const expected = [
        {
          text: 'Alpha',
          class: 'govuk-tag--orange',
        },
        {
          text: 'Beta',
          class: 'govuk-tag--grey',
        },
      ]

      const stub = community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({ registrations }))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual(expected)
      expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', activeOnly: true })
    })

    it('handles empty risk registrations', async () => {
      const stub = community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({}))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual([])
      expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', activeOnly: true })
    })

    it('filters excluded registrations ', async () => {
      const registrations = [fakeRegistration({ type: { code: IGNORED_REGISTRATION } })]

      const stub = community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({ registrations }))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual([])
      expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', activeOnly: true })
    })
  })
})
