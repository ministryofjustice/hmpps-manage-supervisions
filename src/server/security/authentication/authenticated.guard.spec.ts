import { Reflector } from '@nestjs/core'
import { AuthenticatedGuard } from './authenticated.guard'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { TokenVerificationService } from '../token-verification/token-verification.service'
import { fakeUser } from '../user/user.fake'
import { PUBLIC_KEY } from './public.decorator'
import { FAKE_CLASS, FAKE_HANDLER, fakeExecutionContext } from '../../util/nest.fake'

describe('AuthenticatedGuard', () => {
  let subject: AuthenticatedGuard
  let reflector: SinonStubbedInstance<Reflector>
  let tokenVerification: SinonStubbedInstance<TokenVerificationService>
  const user = fakeUser()

  beforeEach(async () => {
    reflector = createStubInstance(Reflector)
    tokenVerification = createStubInstance(TokenVerificationService)
    subject = new AuthenticatedGuard(reflector as any, tokenVerification as any)
  })

  function whenActivating(isAuthenticated: boolean, locals: any = {}) {
    const context = fakeExecutionContext({
      request: { user, isAuthenticated: () => isAuthenticated },
      response: { locals },
    })
    return subject.canActivate(context)
  }

  it('is public', async () => {
    reflector.getAllAndOverride.withArgs(PUBLIC_KEY, match.array.deepEquals([FAKE_HANDLER, FAKE_CLASS])).returns(true)
    const locals: any = {}
    const result = await whenActivating(false, locals)
    expect(result).toBe(true)
    expect(locals.isPublic).toBe(true)
  })

  it('is not authenticated', async () => {
    const result = await whenActivating(false)
    expect(result).toBe(false)
  })

  it('token verification is disabled', async () => {
    tokenVerification.isEnabled.returns(false)
    const result = await whenActivating(true)
    expect(result).toBe(true)
  })

  it('token is invalid', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(false)
    const result = await whenActivating(true)
    expect(result).toBe(false)
  })

  it('token is valid', async () => {
    tokenVerification.isEnabled.returns(true)
    tokenVerification.verifyToken.withArgs(user).resolves(true)
    const result = await whenActivating(true)
    expect(result).toBe(true)
  })
})
