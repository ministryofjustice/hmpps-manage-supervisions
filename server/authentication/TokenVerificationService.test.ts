import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { RestClient } from '../data/RestClient'
import { RestClientFactory } from '../data/RestClientFactory'
import { TokenVerificationResponse, TokenVerificationService } from './TokenVerificationService'
import { fakeUserPrincipal } from './user.fake'
import { ConfigService } from '../config'
import { fakeConfig } from '../config/config.fake'
import { plainToClass } from 'class-transformer'

function fakeTokenVerificationResponse(active = true): TokenVerificationResponse {
  return plainToClass(TokenVerificationResponse, { active } as TokenVerificationResponse)
}

describe('TokenVerificationService', () => {
  let config: ConfigService
  let client: SinonStubbedInstance<RestClient>
  let factory: SinonStubbedInstance<RestClientFactory>
  let user: UserPrincipal
  let subject: TokenVerificationService

  beforeEach(() => {
    config = fakeConfig()
    user = fakeUserPrincipal()
    client = createStubInstance(RestClient)
    factory = createStubInstance(RestClientFactory)
    factory.build.withArgs('tokenVerification', user).resolves(client as any)
    subject = new TokenVerificationService(factory as any, config)
  })

  it('verifying active token', async () => {
    const response = fakeTokenVerificationResponse()
    client.post.withArgs(TokenVerificationResponse, '/token/verify').resolves(response)
    const observed = await subject.verifyToken(user)
    expect(observed).toBe(true)
  })

  it('verifying inactive token', async () => {
    const response = fakeTokenVerificationResponse(false)
    client.post.withArgs(TokenVerificationResponse, '/token/verify').resolves(response)
    const observed = await subject.verifyToken(user)
    expect(observed).toBe(false)
  })

  it('is enabled', async () => {
    const observed = subject.isEnabled()
    expect(observed).toBe(config.apis.tokenVerification.enabled)
  })
})
