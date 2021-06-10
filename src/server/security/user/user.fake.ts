import * as faker from 'faker'
import { UserProfile } from './user.service'
import { DateTime } from 'luxon'
import { fake, fakeClass } from '../../util/util.fake'

export const fakeUserProfile = fakeClass(UserProfile, () => ({
  username: faker.internet.userName(),
  active: true,
  authSource: faker.random.arrayElement(['delius', 'hmpps']),
  name: faker.name.findName(),
  userId: faker.datatype.uuid(),
  uuid: faker.datatype.uuid(),
}))

export const fakeUser = fake<User, { expired?: boolean }>(({ expired = false }) => ({
  ...fakeUserProfile(),
  token: faker.datatype.uuid(),
  expiresAt: DateTime.utc().toSeconds() + (expired ? -1 : 600),
  refreshToken: faker.datatype.uuid(),
  displayName: faker.name.findName(),
  authorities: ['ROLE_1', 'ROLE_2'],
  scope: ['read', 'write'],
  staffCode: faker.datatype.uuid(),
}))
