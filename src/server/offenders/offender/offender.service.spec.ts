import { Test } from '@nestjs/testing'
import { OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { CommunityApiService } from '../../community-api'
import { fakeOffenderDetail } from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'

describe('OffenderService', () => {
  let subject: OffenderService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OffenderService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(OffenderService)
    community = module.get(CommunityApiService)
  })

  it('gets offender detail', async () => {
    const offender = fakeOffenderDetail()
    const stub = community.offender.getOffenderDetailByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await subject.getOffenderDetail('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })
})
