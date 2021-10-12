import { Test } from '@nestjs/testing'
import { match } from 'sinon'
import { ConvictionService } from './conviction.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api.mock'
import { CommunityApiService } from '../community-api.service'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { fakeConviction } from '../community-api.fake'
import { Conviction } from '../client'
import { DateTime } from 'luxon'

describe('ConvictionService', () => {
  let subject: ConvictionService
  let communityApi: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ConvictionService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(ConvictionService)
    communityApi = module.get(CommunityApiService)
  })

  function havingConvictions(...partials: DeepPartial<Conviction>[]): Conviction[] {
    const convictions = partials.map(p => fakeConviction(p))
    communityApi.offender.getConvictionsForOffenderByCrnUsingGET
      .withArgs(match({ crn: 'some-crn' }))
      .resolves(fakeOkResponse(convictions))
    return convictions
  }

  it('handles no convictions', async () => {
    havingConvictions()
    const observed = await subject.getConvictions('some-crn')
    expect(observed).toEqual({ current: null, previous: [] })
  })

  it('gets convictions', async () => {
    const [current, previous] = havingConvictions(
      { active: true },
      { active: false },
      { active: false, sentence: { terminationDate: '2018-01-01', description: 'Really old conviction, ignored' } },
    )
    const observed = await subject.getConvictions('some-crn', DateTime.fromISO('2018-01-02'))
    expect(observed).toEqual({ current, previous: [previous] })
  })
})
