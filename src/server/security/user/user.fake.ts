import { merge } from 'lodash'
import * as faker from 'faker'
import { UserProfile } from './user.service'
import { plainToClass } from 'class-transformer'

export function fakeUserProfile(partial: DeepPartial<UserProfile> = {}): UserProfile {
  return plainToClass(
    UserProfile,
    merge(
      {
        username: faker.internet.userName(),
        active: faker.datatype.boolean(),
        authSource: faker.random.arrayElement(['delius', 'hmpps']),
        name: faker.name.findName(),
        userId: faker.datatype.uuid(),
        uuid: faker.datatype.uuid(),
      } as UserProfile,
      partial,
    ),
  )
}

export function fakeUser(partial: DeepPartial<User> = {}): User {
  return merge(
    {
      ...fakeUserProfile(),
      token: faker.internet.password(),
      displayName: faker.name.findName(),
    } as User,
    partial,
  )
}
