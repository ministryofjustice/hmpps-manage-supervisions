import { ConfigService } from '../config'
import { AuthenticationMethod, RestClientFactory } from './RestClientFactory'
import { HmppsOidcClient } from '../authentication/HmppsOidcClient'
import { fakeConfig } from '../config/config.fake'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { fakeUserPrincipal } from '../authentication/user.fake'
import { RestClient } from './RestClient'
import * as faker from 'faker'

describe('RestClientFactory', () => {
  let config: ConfigService
  let auth: SinonStubbedInstance<HmppsOidcClient>
  let user: UserPrincipal
  let subject: RestClientFactory

  beforeEach(() => {
    config = fakeConfig()
    auth = createStubInstance(HmppsOidcClient)
    user = fakeUserPrincipal()
    subject = new RestClientFactory(config, auth as any)
  })

  it('using token pass through', async () => {
    const client = await subject.build('community', user)
    expect(client).toBeInstanceOf(RestClient)
    expect(auth.getDeliusUserToken.called).toBeFalsy()
  })

  it('using delius user token', async () => {
    const token = faker.internet.password()
    const stub = auth.getDeliusUserToken.withArgs(user).resolves(token)
    const client = await subject.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
    expect(client).toBeInstanceOf(RestClient)
    expect(stub.calledOnce).toBeTruthy()
  })
})
