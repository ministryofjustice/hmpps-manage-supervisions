import { Test } from '@nestjs/testing'
import { AssessRisksAndNeedsApiService } from './assess-risks-and-needs-api.service'
import { fakeUser } from '../security/user/user.fake'
import { REQUEST } from '@nestjs/core'
import { fakeAllRoshRiskDto, fakeAssessmentNeedsDto } from './assess-risks-and-needs-api.fake'
import { Logger } from '@nestjs/common'
import { MockRestModule } from '../common/rest/rest.mock'
import { AuthenticationMethod } from '../common'
import MockAdapter from 'axios-mock-adapter'

describe('AssessRisksAndNeedsApiService', () => {
  let subject: AssessRisksAndNeedsApiService
  let user: User
  let client: MockAdapter

  beforeEach(async () => {
    user = fakeUser()

    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register([
          { name: 'assessRisksAndNeeds', user, authMethod: AuthenticationMethod.ReissueForDeliusUser },
        ]),
      ],
      providers: [AssessRisksAndNeedsApiService, { provide: REQUEST, useValue: { user } }],
    })
      .setLogger(new Logger())
      .compile()

    subject = await module.resolve(AssessRisksAndNeedsApiService)
    client = module.get(MockRestModule.CLIENT)
  })

  it('calls risks api', async () => {
    const risks = fakeAllRoshRiskDto()
    client.onGet('/risks/crn/X12345').reply(200, risks)
    const observed = await subject.risk.getRoshRisksByCrn({
      crn: 'X12345',
    })
    expect(observed.data).toEqual(risks)
  })

  it('calls needs api', async () => {
    const needs = fakeAssessmentNeedsDto()
    client.onGet('/needs/crn/some-crn').reply(200, needs)
    const observed = await subject.needs.getCriminogenicNeedsByCrn({ crn: 'some-crn' })
    expect(observed.data).toEqual(needs)
  })
})
