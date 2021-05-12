import { Reflector } from '@nestjs/core'
import { AuthenticatedGuard } from './authenticated.guard'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { TokenVerificationService } from '../token-verification/token-verification.service'
import { fakeUser } from '../user/user.fake'
import { PUBLIC_KEY } from '../meta/public.decorator'

const handler = 'handler'
const cls = 'cls'

describe('AuthenticatedGuard', () => {
  let subject: AuthenticatedGuard
  let reflector: SinonStubbedInstance<Reflector>
  let tokenVerification: SinonStubbedInstance<TokenVerificationService>
  let user: User
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
    subject = new AuthenticatedGuard(reflector as any, tokenVerification as any)
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

  it('token verification is disabled', async () => {
    tokenVerification.isEnabled.returns(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('token is invalid', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(false)
    const result = await subject.canActivate(context)
    expect(result).toBe(false)
  })

  it('token is valid', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(true)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })
})
