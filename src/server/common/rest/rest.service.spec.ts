import { Test, TestingModule } from '@nestjs/testing'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import * as faker from 'faker'
import { AuthenticationMethod, RestService } from './rest.service'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { FakeConfigModule } from '../../config/config.fake'
import { fakeUser } from '../../security/user/user.fake'
import { RestClient } from './rest-client'
import { HttpService } from '@nestjs/common'

describe('RestService', () => {
  let subject: RestService
  let oidc: SinonStubbedInstance<HmppsOidcService>
  let user: User

  beforeEach(async () => {
    user = fakeUser()
    oidc = createStubInstance(HmppsOidcService)
    const http = createStubInstance(HttpService)
    const module: TestingModule = await Test.createTestingModule({
      imports: [FakeConfigModule.register()],
      providers: [RestService, { provide: HmppsOidcService, useValue: oidc }, { provide: HttpService, useValue: http }],
    }).compile()

    subject = module.get<RestService>(RestService)
  })

  it('using token pass through', async () => {
    const client = await subject.build('community', user)
    expect(client).toBeInstanceOf(RestClient)
    expect(oidc.getDeliusUserToken.called).toBeFalsy()
  })

  it('using delius user token', async () => {
    const token = faker.internet.password()
    const stub = oidc.getDeliusUserToken.withArgs(user).resolves(token)
    const client = await subject.build('community', user, AuthenticationMethod.ReissueForDeliusUser)
    expect(client).toBeInstanceOf(RestClient)
    expect(stub.calledOnce).toBeTruthy()
  })
})
