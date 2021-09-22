import * as faker from 'faker'
import { fakeClass } from '../../util/util.fake'
import { SecurityContext } from './security-context'
import { Role } from '../authorization'

export const fakeSecurityContext = fakeClass(SecurityContext, (options, partial) => ({
  username: faker.internet.userName(),
  staffCode: faker.datatype.uuid(),
  authorities: partial.authorities || [Role.ReadWrite, Role.ReadOnly],
}))
