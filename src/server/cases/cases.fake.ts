import { fake } from '../util/util.fake'
import { Case } from './cases.types'
import * as faker from 'faker'
import { fakeCrn } from '../community-api/community-api.fake'

export const fakeCase = fake<Case>(() => {
  return {
    crn: fakeCrn(),
    name: faker.name.findName(),
  }
})
