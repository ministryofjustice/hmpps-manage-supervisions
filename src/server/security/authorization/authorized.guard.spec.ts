import { AuthorizedGuard } from './authorized.guard'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { Reflector } from '@nestjs/core'
import { fakeUser } from '../user/user.fake'
import { ROLES_KEY } from './roles.decorator'
import { Role } from './authorization.types'
import { UnauthorizedException } from '@nestjs/common'
import { FAKE_CLASS, FAKE_HANDLER, fakeExecutionContext } from '../../util/nest.fake'

describe('AuthorizedGuard', () => {
  let subject: AuthorizedGuard
  let reflector: SinonStubbedInstance<Reflector>

  beforeAll(async () => {
    reflector = createStubInstance(Reflector)
    subject = new AuthorizedGuard(reflector as any)
  })

  function havingEndpointRoles(...roles: Role[]) {
    reflector.getAllAndOverride.withArgs(ROLES_KEY, match.array.deepEquals([FAKE_HANDLER, FAKE_CLASS])).returns(roles)
  }

  function whenActivating(isAuthenticated: boolean, locals: any = {}) {
    const context = fakeExecutionContext({
      request: { user: fakeUser({ authorities: [Role.ReadOnly] }), isAuthenticated: () => isAuthenticated },
      response: { locals },
    })
    return subject.canActivate(context)
  }

  it('is always authorised when public', async () => {
    const result = whenActivating(false, { isPublic: true })
    expect(result).toBe(true)
  })

  it('is not authenticated', async () => {
    await expect(() => whenActivating(false)).toThrow('authorization requires authentication')
  })

  it('is authorized for endpoint with no roles specified', async () => {
    havingEndpointRoles()
    const result = whenActivating(true)
    expect(result).toBe(true)
  })

  it('is authorized for endpoint with default behaviour', async () => {
    const result = whenActivating(true)
    expect(result).toBe(true)
  })

  it('is authorised when has specified role', async () => {
    havingEndpointRoles(Role.ReadOnly)
    const result = whenActivating(true)
    expect(result).toBe(true)
  })

  it('is not authorised when does not have specified role', async () => {
    havingEndpointRoles(Role.ReadWrite)
    expect(() => whenActivating(true)).toThrow(UnauthorizedException)
  })
})
