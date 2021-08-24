import { Test } from '@nestjs/testing'
import { AssessRisksAndNeedsApiService, RiskDtoCurrent, RiskDtoPrevious } from '../../../assess-risks-and-needs-api'
import { fakeOkResponse, fakeRestError } from '../../../common/rest/rest.fake'
import { RiskRegistrations, Risks } from './risk.types'
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
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

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
          level: { colour: GovUkUiTagColour.DarkRed, index: 3, text: 'Very high' },
          riskLevels: { HIGH: ['Public'], LOW: ['Known Adult'], VERY_HIGH: ['Children', 'Staff'] },
          risks: [
            {
              level: 'VERY_HIGH',
              meta: { colour: GovUkUiTagColour.DarkRed, index: 3, text: 'Very high' },
              riskTo: 'Children',
            },
            {
              level: 'VERY_HIGH',
              meta: { colour: GovUkUiTagColour.DarkRed, index: 3, text: 'Very high' },
              riskTo: 'Staff',
            },
            {
              level: 'HIGH',
              meta: { colour: GovUkUiTagColour.Red, index: 2, text: 'High' },
              riskTo: 'Public',
            },
            {
              level: 'LOW',
              meta: { colour: GovUkUiTagColour.Green, index: 0, text: 'Low' },
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
    it('gets active risk registrations', async () => {
      const registrations = [
        fakeRegistration({
          registrationId: 44878,
          active: true,
          type: { description: 'Beta' },
          riskColour: 'White',
          notes: 'Some notes',
          nextReviewDate: '2021-03-02',
        }),
        fakeRegistration({
          registrationId: 44879,
          active: true,
          type: { description: 'Alpha' },
          riskColour: 'Amber',
          notes: null,
          nextReviewDate: null,
        }),
      ]

      const stub = community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({ registrations }))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual({
        active: [
          { text: 'Alpha', notes: null, link: 'risk/44879', reviewDue: null },
          {
            text: 'Beta',
            notes: 'Some notes',
            link: 'risk/44878',
            reviewDue: DateTime.fromObject({ day: 2, month: 3, year: 2021 }),
          },
        ],
        inactive: [],
      } as RiskRegistrations)
      expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
    })

    it('counts inactive risk registrations', async () => {
      const registrations = [
        fakeRegistration({
          registrationId: 1234,
          active: false,
          type: { description: 'Beta' },
          riskColour: 'White',
          deregisteringNotes: 'Some notes',
          endDate: '2021-03-02',
          nextReviewDate: null,
        }),
        fakeRegistration({
          registrationId: 1235,
          active: false,
          type: { description: 'Alpha' },
          riskColour: 'Amber',
          deregisteringNotes: null,
          endDate: '2021-07-01',
          nextReviewDate: null,
        }),
      ]

      community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({ registrations }))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual({
        active: [],
        inactive: [
          {
            text: 'Alpha',
            notes: null,
            link: 'removed-risk/1235',
            endDate: DateTime.fromObject({ day: 1, month: 7, year: 2021 }),
          },
          {
            text: 'Beta',
            notes: 'Some notes',
            link: 'removed-risk/1234',
            endDate: DateTime.fromObject({ day: 2, month: 3, year: 2021 }),
          },
        ],
      } as RiskRegistrations)
    })

    it('handles empty risk registrations', async () => {
      community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({}))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual({ active: [], inactive: [] } as RiskRegistrations)
    })

    it('filters excluded registrations ', async () => {
      const registrations = [fakeRegistration({ type: { code: IGNORED_REGISTRATION } })]

      community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({ registrations }))
      const observed = await subject.getRiskRegistrations('some-crn')

      expect(observed).toEqual({ active: [], inactive: [] } as RiskRegistrations)
    })
  })
})
