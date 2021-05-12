import { Test } from '@nestjs/testing'
import { UserProfile, UserRole, UserService } from './user.service'
import { MockRestModule } from '../../common/rest/rest.mock'
import { fakeUser, fakeUserProfile, fakeUserRole } from './user.fake'
import { SinonStubbedInstance } from 'sinon'
import { RestClient } from '../../common'

describe('UserService', () => {
  let subject: UserService
  let user: User
  let client: SinonStubbedInstance<RestClient>

  beforeEach(async () => {
    user = fakeUser()
    const module = await Test.createTestingModule({
      imports: [MockRestModule.register('hmppsAuth', user)],
      providers: [UserService],
    }).compile()

    subject = module.get(UserService)
    client = module.get(MockRestModule.CLIENT)
  })

  it('should get user', async () => {
    const profile = fakeUserProfile()
    client.get.withArgs(UserProfile, '/api/user/me').resolves(profile)
    const observed = await subject.getUser(user)
    expect(observed).toBe(profile)
  })

  it('should get user roles', async () => {
    const roles = [fakeUserRole({ roleCode: 'ROLE_1' }), fakeUserRole({ roleCode: 'ROLE_2' })]
    client.get.withArgs(UserRole, '/api/user/me/roles').resolves(roles)
    const observed = await subject.getUserRoles(user)
    expect(observed).toEqual(['ROLE_1', 'ROLE_2'])
  })
})
