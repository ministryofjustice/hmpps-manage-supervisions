import { fakeUser } from '../user/user.fake'
import { Role } from '../authorization'
import { plainToClass } from 'class-transformer'
import { SecurityContext } from './security-context'

describe('SecurityContext', () => {
  const user = fakeUser({ authorities: [Role.ReadOnly.toLowerCase()], staffCode: 'ABC', username: 'bob' })
  const context = plainToClass(SecurityContext, user, { excludeExtraneousValues: true })

  it('has role in authorities', () => {
    expect(context.hasRole(Role.ReadOnly)).toBe(true)
  })

  it('does not have role not in authorities', () => {
    expect(context.hasRole(Role.ReadWrite)).toBe(false)
  })

  it('maps user properties', () => {
    expect({ ...context }).toEqual({
      authorities: [Role.ReadOnly],
      staffCode: 'ABC',
      username: 'bob',
    })
  })
})
