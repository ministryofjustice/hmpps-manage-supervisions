import * as faker from 'faker'
import { UserProfile } from './user.service'
import { fake, fakeClass } from '../../util/util.fake'

export const fakeUserProfile = fakeClass(UserProfile, () => ({
  username: faker.internet.userName(),
  active: true,
  authSource: 'delius',
  name: faker.name.findName(),
  userId: faker.datatype.uuid(),
  uuid: faker.datatype.uuid(),
}))

export const fakeUser = fake<User>((options, partial = {}) => ({
  ...fakeUserProfile(),
  token: faker.datatype.uuid(),
  displayName: faker.name.findName(),
  authorities: partial.authorities || ['ROLE_PROBATION', 'ROLE_MANAGE_SUPERVISIONS_RO', 'ROLE_MANAGE_SUPERVISIONS'],
  scope: ['read', 'write'],
}))
