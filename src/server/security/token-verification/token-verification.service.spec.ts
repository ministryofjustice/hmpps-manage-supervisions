import { Test } from '@nestjs/testing'
import { TokenVerificationResponse, TokenVerificationService } from './token-verification.service'
import { SinonStubbedInstance } from 'sinon'
import { RestClient } from '../../common'
import { MockRestModule } from '../../common/rest/rest.mock'
import { fakeUser } from '../user/user.fake'
import { plainToClass } from 'class-transformer'
import { FakeConfigModule } from '../../config/config.fake'

function fakeTokenVerificationResponse(active = true): TokenVerificationResponse {
  return plainToClass(TokenVerificationResponse, { active } as TokenVerificationResponse)
}

describe('TokenVerificationService', () => {
  let subject: TokenVerificationService
  let user: User
  let client: SinonStubbedInstance<RestClient>

  beforeEach(async () => {
    user = fakeUser()
    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register('tokenVerification', user),
        FakeConfigModule.register({ apis: { tokenVerification: { enabled: true } } }),
      ],
      providers: [TokenVerificationService],
    }).compile()

    subject = module.get(TokenVerificationService)
    client = module.get(MockRestModule.CLIENT)
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
    expect(observed).toBe(true)
  })
})
