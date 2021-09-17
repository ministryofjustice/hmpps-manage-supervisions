import { AuthorizedGuard } from './authorized.guard'
import { SinonStubbedInstance, createStubInstance, match } from 'sinon'
import { Reflector } from '@nestjs/core'
import { fakeUser } from '../user/user.fake'
import { ROLES_KEY } from './roles.decorator'
import { Role } from './authorization.types'
import { UnauthorizedException } from '@nestjs/common'

const handler = 'handler'
const cls = 'cls'

describe('AuthorizedGuard', () => {
  let subject: AuthorizedGuard
  let reflector: SinonStubbedInstance<Reflector>
  let user: User
  let isAuthenticated: boolean
  let locals: any
  const context: any = {
    switchToHttp: () => ({
      getRequest: () => ({ user, isAuthenticated: () => isAuthenticated }),
      getResponse: () => ({ locals }),
    }),
    getHandler: () => handler,
    getClass: () => cls,
  }

  beforeEach(async () => {
    user = fakeUser({ authorities: [Role.ReadOnly] })
    isAuthenticated = true
    locals = {}
    reflector = createStubInstance(Reflector)
    subject = new AuthorizedGuard(reflector as any)
  })

  it('is always authorised when public', async () => {
    locals.isPublic = true
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('is not authenticated', async () => {
    isAuthenticated = false
    await expect(() => subject.canActivate(context)).toThrow('authorization requires authentication')
  })

  it('is authorized for endpoint with no roles specified', async () => {
    havingEndpointRoles()
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('is authorized for endpoint with default behaviour', async () => {
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('is authorised when has specified role', async () => {
    havingEndpointRoles(Role.ReadOnly)
    const result = await subject.canActivate(context)
    expect(result).toBe(true)
  })

  it('is not authorised when does not have specified role', async () => {
    havingEndpointRoles(Role.ReadWrite)
    expect(() => subject.canActivate(context)).toThrow(UnauthorizedException)
  })

  function havingEndpointRoles(...roles: Role[]) {
    reflector.getAllAndOverride.withArgs(ROLES_KEY, match.array.deepEquals([handler, cls])).returns(roles)
  }
})
