import { Test } from '@nestjs/testing'
import {
  AssessmentNeedDtoSeverity,
  RiskDtoAllRisksViewCurrent,
  RiskDtoAllRisksViewPrevious,
} from '../../../assess-risks-and-needs-api/client'
import { fakeOkResponse, fakeRestError } from '../../../common/rest/rest.fake'
import { RiskRegistrationDetails, CriminogenicNeed, RiskRegistrations, Risks } from './risk.types'
import { MockCommunityApiModule, MockCommunityApiService } from '../../../community-api/community-api.mock'
import { RiskService } from './risk.service'
import {
  MockAssessRisksAndNeedsApiModule,
  MockAssessRisksAndNeedsApiService,
} from '../../../assess-risks-and-needs-api/assess-risks-and-needs-api.mock'
import { CommunityApiService } from '../../../community-api'
import {
  fakeAllRoshRiskDto,
  fakeAssessmentNeedsDto,
} from '../../../assess-risks-and-needs-api/assess-risks-and-needs-api.fake'
import { fakeRegistration } from '../../../community-api/community-api.fake'
import { FakeConfigModule } from '../../../config/config.fake'
import { HttpStatus } from '@nestjs/common'
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../../util/govuk-ui'
import { AssessRisksAndNeedsApiService, NeedsAssessmentSection } from '../../../assess-risks-and-needs-api'

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
            previous: RiskDtoAllRisksViewPrevious.No,
            previousConcernsText: null,
            current: RiskDtoAllRisksViewCurrent.Yes,
            currentConcernsText: 'Some current concerns',
          },
          selfHarm: {
            previous: RiskDtoAllRisksViewPrevious.Yes,
            previousConcernsText: null,
            current: RiskDtoAllRisksViewCurrent.Yes,
            currentConcernsText: 'Some ignored current concerns',
          },
          custody: {
            previous: RiskDtoAllRisksViewPrevious.Yes,
            previousConcernsText: 'Some previous concerns',
            current: RiskDtoAllRisksViewCurrent.No,
            currentConcernsText: null,
          },
          hostelSetting: {
            previous: RiskDtoAllRisksViewPrevious.No,
            previousConcernsText: null,
            current: RiskDtoAllRisksViewCurrent.No,
            currentConcernsText: null,
          },
          vulnerability: {
            previous: RiskDtoAllRisksViewPrevious.No,
            previousConcernsText: null,
            current: RiskDtoAllRisksViewCurrent.No,
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
        assessedOn: '2000-01-02T13:30:00',
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
          current: true,
          previous: true,
        },
        assessedOn: DateTime.fromISO('2000-01-02T13:30:00'),
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
          current: false,
          previous: false,
        },
        assessedOn: null,
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
            removed: DateTime.fromObject({ day: 1, month: 7, year: 2021 }),
          },
          {
            text: 'Beta',
            notes: 'Some notes',
            link: 'removed-risk/1234',
            removed: DateTime.fromObject({ day: 2, month: 3, year: 2021 }),
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

  describe('getting risk registration details', () => {
    it('gets risk details', async () => {
      const registration = fakeRegistration({
        registrationId: 44878,
        startDate: '2020-05-16',
        registeringOfficer: { code: 'ABC123', forenames: 'Paul', surname: 'Dryburgh' },
        active: true,
        type: { code: 'ALAN', description: 'Alert Notice' },
        riskColour: 'White',
        notes: 'Some notes',
        nextReviewDate: '2021-03-02',
      })
      community.risks.getOffenderRegistrationDetailsByCrnUsingGET.resolves(fakeOkResponse(registration))

      const observed = await subject.getRiskRegistrationDetails('some-crn', 1234)

      expect(observed).toEqual({
        added: DateTime.fromObject({ day: 16, month: 5, year: 2020 }),
        addedBy: 'Paul Dryburgh',
        link: 'risk/44878',
        notes: 'Some notes',
        text: 'Alert Notice',
        removed: null,
        removedBy: undefined,
        removedNotes: null,
        reviewDue: DateTime.fromObject({ day: 2, month: 3, year: 2021 }),
        reviewed: null,
        reviewedBy: null,
        typeInfo: {
          description: 'Alert Notice',
          furtherInformation:
            'Should only be used when a national alert notice has been issued. <br>Prompts User Alert Notice when viewing the Offender Record.',
          purpose: 'To distribute priority information/warning/alerts relating to an offender.',
          suggestedReviewFrequency: 6,
          termination: "Don't remove at termination.",
        },
      } as RiskRegistrationDetails)
    })
  })

  describe('getting needs', () => {
    it('handles missing offender', async () => {
      arn.needs.getCriminogenicNeedsByCrn.withArgs({ crn: 'some-crn' }).throws(fakeRestError(HttpStatus.NOT_FOUND))
      const observed = await subject.getNeeds('some-crn')
      expect(observed).toEqual([])
    })

    it('handles empty data', async () => {
      arn.needs.getCriminogenicNeedsByCrn.withArgs({ crn: 'some-crn' }).resolves(
        fakeOkResponse({
          identifiedNeeds: [],
          unansweredNeeds: [],
          notIdentifiedNeeds: [],
          assessedOn: '2021-02-03',
        }),
      )
      const observed = await subject.getNeeds('some-crn')
      expect(observed).toEqual([])
    })

    it('gets identified needs', async () => {
      const needs = fakeAssessmentNeedsDto({
        identifiedNeeds: [
          {
            section: NeedsAssessmentSection.EducationTrainingAndEmployability,
            severity: AssessmentNeedDtoSeverity.Standard,
            name: 'Education',
          },
          {
            section: NeedsAssessmentSection.FinancialManagementAndIncome,
            severity: AssessmentNeedDtoSeverity.Severe,
            name: 'Financial',
          },
          {
            section: NeedsAssessmentSection.Accommodation,
            severity: AssessmentNeedDtoSeverity.NoNeed,
          },
        ],
        assessedOn: '2021-02-03',
      })
      arn.needs.getCriminogenicNeedsByCrn.withArgs({ crn: 'some-crn' }).resolves(fakeOkResponse(needs))
      const observed = await subject.getNeeds('some-crn')
      expect(observed).toEqual(
        ['Education', 'Financial'].map<CriminogenicNeed>(name => ({
          name,
          date: DateTime.fromObject({ year: 2021, month: 2, day: 3 }),
        })),
      )
    })
  })
})
