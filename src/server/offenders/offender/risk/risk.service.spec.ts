import { Test } from '@nestjs/testing'
import { AssessRisksAndNeedsApiService } from '../../../assess-risks-and-needs-api'
import { fakeOkResponse } from '../../../common/rest/rest.fake'
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

describe('RiskService', () => {
  let subject: RiskService
  let community: MockCommunityApiService
  let arn: MockAssessRisksAndNeedsApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RiskService],
      imports: [MockCommunityApiModule.register(), MockAssessRisksAndNeedsApiModule.register()],
    }).compile()

    subject = module.get(RiskService)
    community = module.get(CommunityApiService)
    arn = module.get(AssessRisksAndNeedsApiService)
  })

  it('gets risks from AR&N', async () => {
    const risks = fakeAllRoshRiskDto()

    const expected = {
      communityRisks: [
        {
          level: {
            class: 'app-tag--dark-red',
            key: 'VERY_HIGH',
            text: 'VERY HIGH',
          },
          riskTo: 'Children',
        },
        {
          level: {
            class: 'app-tag--dark-red',
            key: 'VERY_HIGH',
            text: 'VERY HIGH',
          },
          riskTo: 'Staff',
        },
        {
          level: {
            class: 'govuk-tag--red',
            key: 'HIGH',
            text: 'HIGH',
          },
          riskTo: 'Public',
        },
        {
          level: {
            class: 'govuk-tag--green',
            key: 'LOW',
            text: 'LOW',
          },
          riskTo: 'Known Adult',
        },
      ],
      overallLevel: {
        class: 'app-tag--dark-red',
        key: 'VERY_HIGH',
        text: 'VERY HIGH',
      },
    }
    const stub = arn.risk.getRoshRisksByCrn.resolves(fakeOkResponse(risks))
    const observed = await subject.getRisks('some-crn')

    expect(observed).toEqual(expected as Risks)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets risk registrations from community API', async () => {
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

  it('returns an empty array if no risk registrations available for CRN', async () => {
    const stub = community.risks.getOffenderRegistrationsByCrnUsingGET.resolves(fakeOkResponse({}))
    const observed = await subject.getRiskRegistrations('some-crn')

    expect(observed).toEqual([])
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn', activeOnly: true })
  })
})
