import { RestClient } from '../data/RestClient'
import { RestClientFactory } from '../data/RestClientFactory'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { fakeUserPrincipal, fakeUserProfile, fakeUserRole } from './user.fake'
import { HmppsAuthClient, UserProfile, UserRole } from './HmppsAuthClient'

describe('HmppsAuthClient', () => {
  let client: SinonStubbedInstance<RestClient>
  let factory: SinonStubbedInstance<RestClientFactory>
  let user: UserPrincipal
  let subject: HmppsAuthClient

  beforeEach(() => {
    user = fakeUserPrincipal()
    client = createStubInstance(RestClient)
    factory = createStubInstance(RestClientFactory)
    factory.build.withArgs('hmppsAuth', user).resolves(client as any)
    subject = new HmppsAuthClient(factory as any)
  })

  it('getting user', async () => {
    const profile = fakeUserProfile()
    client.get.withArgs(UserProfile, '/api/user/me').resolves(profile)
    const observed = await subject.getUser(user)
    expect(observed).toBe(profile)
  })

  it('getting user roles', async () => {
    const roles = [fakeUserRole(), fakeUserRole()]
    client.get.withArgs(UserRole, '/api/user/me/roles').resolves(roles)
    const observed = await subject.getUserRoles(user)
    expect(observed).toStrictEqual(roles.map(x => x.roleCode))
  })
})
