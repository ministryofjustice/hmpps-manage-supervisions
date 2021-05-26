import { Test } from '@nestjs/testing'
import { UserRole, UserService } from './user.service'
import { MockRestModule } from '../../common/rest/rest.mock'
import { fakeUser, fakeUserProfile } from './user.fake'
import { classToPlain } from 'class-transformer'
import MockAdapter from 'axios-mock-adapter'
import { StaffDetails } from '../../community-api'
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

  it('should get user roles', async () => {
    const roles: UserRole[] = [{ roleCode: 'ROLE_1' }, { roleCode: 'ROLE_2' }]
    client.onGet('/api/user/me/roles').reply(200, roles)
    const observed = await subject.getUserRoles(user)
    expect(observed).toEqual(['ROLE_1', 'ROLE_2'])
  })

  it('should get staff details', async () => {
    const staffDetails: StaffDetails = fakeStaffDetails()
    client.onGet(`/secure/staff/username/${user.username}`).reply(200, staffDetails)
    const observed = await subject.getStaffDetails(user)
    expect(observed).toEqual(staffDetails)
  })
})
