import { FlatRiskToSelf, Level, RegistrationFlag, Risks, RoshRisk } from './risk.types'
import { fake } from '../../../util/util.fake'
import * as faker from 'faker'

export const fakeRegistrationFlag = fake<RegistrationFlag>(() => ({
  text: faker.lorem.sentence(),
  class: faker.datatype.uuid(),
}))

const fakeLevel = fake<Level>(() => ({
  class: 'app-tag--dark-red',
  text: faker.random.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH']),
  index: faker.datatype.number(),
}))

const fakeRoshRisk = fake<RoshRisk>(() => ({
  level: fakeLevel(),
  riskTo: faker.random.arrayElement(['Children', 'Staff', 'Public', 'Known Adult', 'Prisoners']),
}))

const fakeFlatRiskToSelf = fake<FlatRiskToSelf>(() => ({
  notes: { current: faker.lorem.sentence(), previous: faker.lorem.sentence() },
  value: faker.lorem.sentence(),
}))

export const fakeRisks = fake<Risks>((options, partial = {}) => ({
  community: {
    level: fakeLevel(),
    risks: partial.community?.risks?.map(x => fakeRoshRisk(x)) || [fakeRoshRisk(), fakeRoshRisk()],
  },
  self: {
    harm: fakeFlatRiskToSelf(),
    custody: fakeFlatRiskToSelf(),
    vulnerability: fakeFlatRiskToSelf(),
  },
}))
