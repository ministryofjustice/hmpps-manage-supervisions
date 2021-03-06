import { Test } from '@nestjs/testing'
import { UserService } from './user.service'
import { MockRestModule } from '../../common/rest/rest.mock'
import { fakeUser, fakeUserProfile } from './user.fake'
import { classToPlain } from 'class-transformer'
import MockAdapter from 'axios-mock-adapter'
import { StaffDetails } from '../../community-api/client'
import { fakeStaffDetails } from '../../community-api/community-api.fake'
import { AuthenticationMethod } from '../../common'

describe('UserService', () => {
  let subject: UserService
  let user: User
  let client: MockAdapter

  beforeEach(async () => {
    user = fakeUser()
    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register([
          { name: 'hmppsAuth', user },
          { name: 'community', user, authMethod: AuthenticationMethod.ReissueForDeliusUser },
        ]),
      ],
      providers: [UserService],
    }).compile()

    subject = module.get(UserService)
    client = module.get(MockRestModule.CLIENT)
  })

  it('should get user', async () => {
    const profile = fakeUserProfile()
    client.onGet('/api/user/me').reply(200, classToPlain(profile))
    const observed = await subject.getUser(user)
    expect(observed).toEqual(profile)
  })

  it('should get staff details', async () => {
    const staffDetails: StaffDetails = fakeStaffDetails()
    client.onGet(`/secure/staff/username/${user.username}`).reply(200, staffDetails)
    const observed = await subject.getStaffDetails(user)
    expect(observed).toEqual(staffDetails)
  })
})
