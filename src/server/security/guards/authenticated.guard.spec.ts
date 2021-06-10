import { Reflector } from '@nestjs/core'
import { AuthenticatedGuard } from './authenticated.guard'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { TokenVerificationService } from '../token-verification/token-verification.service'
import { fakeUser } from '../user/user.fake'
import { PUBLIC_KEY } from '../meta/public.decorator'
import { Test } from '@nestjs/testing'
import { HmppsOidcService } from '../../common'
import { FakeConfigModule } from '../../config/config.fake'
import { ServerConfig } from '../../config'
import { ConfigService } from '@nestjs/config'

const handler = 'handler'
const cls = 'cls'

describe('AuthenticatedGuard', () => {
  let subject: AuthenticatedGuard
  let reflector: SinonStubbedInstance<Reflector>
  let tokenVerification: SinonStubbedInstance<TokenVerificationService>
  let oidc: SinonStubbedInstance<HmppsOidcService>
  let user: User
  let config: ServerConfig
  let isAuthenticated: boolean
  const context: any = {
    switchToHttp: () => ({
      getRequest: () => ({ user, isAuthenticated: () => isAuthenticated }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  }

  beforeEach(async () => {
    user = fakeUser()
    isAuthenticated = true
    reflector = createStubInstance(Reflector)
    tokenVerification = createStubInstance(TokenVerificationService)
    oidc = createStubInstance(HmppsOidcService)

    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register({ server: { refreshEnabled: true } })],
      providers: [
        AuthenticatedGuard,
        { provide: Reflector, useValue: reflector },
        { provide: TokenVerificationService, useValue: tokenVerification },
        { provide: HmppsOidcService, useValue: oidc },
      ],
    }).compile()

    subject = module.get(AuthenticatedGuard)
    config = module.get(ConfigService).get('server')
  })

  it('is public', async () => {
    reflector.getAllAndOverride.withArgs(PUBLIC_KEY, match.array.deepEquals([handler, cls])).returns(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('is not authenticated', async () => {
    isAuthenticated = false
    const result = await subject.canActivate(context)
    expect(result).toBe(false)
  })

  it('is expired & refresh fails', async () => {
    user = fakeUser({}, { expired: true })
    oidc.tryRefresh.withArgs(user).resolves(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(false)
  })

  it('is expired & refresh succeeds', async () => {
    user = fakeUser({}, { expired: true })
    oidc.tryRefresh.withArgs(user).resolves(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('token verification is disabled', async () => {
    tokenVerification.isEnabled.returns(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('token is invalid & refresh fails', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(false)
    oidc.tryRefresh.withArgs(user).resolves(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(false)
  })

  it('token is invalid & refresh succeeds', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(false)
    oidc.tryRefresh.withArgs(user).resolves(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('token is invalid & refresh disabled', async () => {
    config.refreshEnabled = false
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(false)
    expect(oidc.tryRefresh.called).toBe(false)
  })

  it('token is valid', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })
})
