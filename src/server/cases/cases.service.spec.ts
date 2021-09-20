import { Test } from '@nestjs/testing'
import { fakeOkResponse } from '../common/rest/rest.fake'
import { CommunityApiService } from '../community-api'
import { StaffCaseloadEntry } from '../community-api/client'
import { fakePaginated } from '../community-api/community-api.fake'
import { MockCommunityApiModule, MockCommunityApiService } from '../community-api/community-api.mock'
import { CasesService } from './cases.service'
import { MockLinksModule } from '../common/links/links.mock'
import { Case } from './cases.types'
import { BreadcrumbType } from '../common/links'

describe('CasesService', () => {
  let subject: CasesService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CasesService],
      imports: [MockCommunityApiModule.register(), MockLinksModule],
    }).compile()

    subject = module.get(CasesService)
    community = module.get(CommunityApiService)
  })

  it('can get cases', async () => {
    const cases: StaffCaseloadEntry[] = [
      { crn: 'J125347', firstName: 'Dan', middleNames: ['Archibald'], surname: 'Gotham', preferredName: 'Danny' },
    ]

    const stub = community.staff.getCasesUsingGET.resolves(fakeOkResponse(fakePaginated(cases)))

    const observed = await subject.getCases('some-username')

    expect(observed).toHaveLength(1)
    expect(observed).toEqual([
      {
        crn: 'J125347',
        name: 'Dan Archibald Gotham',
        links: { view: MockLinksModule.of({ crn: 'J125347' }).url(BreadcrumbType.Case) },
      },
    ] as Case[])

    expect(stub.getCall(0).firstArg).toEqual({ username: 'some-username', unpaged: true })
  })
})
