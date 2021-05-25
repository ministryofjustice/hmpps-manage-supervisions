import { Test } from '@nestjs/testing'
import { TokenVerificationResponse, TokenVerificationService } from './token-verification.service'
import { MockRestModule } from '../../common/rest/rest.mock'
import { fakeUser } from '../user/user.fake'
import { FakeConfigModule } from '../../config/config.fake'
import MockAdapter from 'axios-mock-adapter'

describe('TokenVerificationService', () => {
  let subject: TokenVerificationService
  let user: User
  let client: MockAdapter

  beforeEach(async () => {
    user = fakeUser()
    const module = await Test.createTestingModule({
      imports: [
        MockRestModule.register([{ name: 'tokenVerification', user }]),
        FakeConfigModule.register({ apis: { tokenVerification: { enabled: true } } }),
      ],
      providers: [TokenVerificationService],
    }).compile()

    subject = module.get(TokenVerificationService)
    client = module.get(MockRestModule.CLIENT)
  })

  it('verifying active token', async () => {
    client.onPost('/token/verify').reply<TokenVerificationResponse>(200, { active: true })
    const observed = await subject.verifyToken(user)
    expect(observed).toBe(true)
  })

  it('verifying inactive token', async () => {
    client.onPost('/token/verify').reply<TokenVerificationResponse>(200, { active: false })
    const observed = await subject.verifyToken(user)
    expect(observed).toBe(false)
  })

  it('verifying expired token', async () => {
    client.onPost('/token/verify').reply(403)
    const observed = await subject.verifyToken(user)
    expect(observed).toBe(false)
  })

  it('is enabled', async () => {
    const observed = subject.isEnabled()
    expect(observed).toBe(true)
  })
})
