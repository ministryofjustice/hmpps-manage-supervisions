import { RegistrationFlag } from './risk.types'
import { fake } from '../../../util/util.fake'
import * as faker from 'faker'

export const fakeRegistrationFlag = fake<RegistrationFlag>(() => ({
  text: faker.lorem.sentence(),
  class: faker.datatype.uuid(),
}))
