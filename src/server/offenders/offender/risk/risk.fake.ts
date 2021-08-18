import { FlatRiskToSelf, RiskLevelMeta, RegistrationFlag, Risks, RoshRisk, RiskLevel } from './risk.types'
import { fake, fakeEnum, fakeRandomArray } from '../../../util/util.fake'
import * as faker from 'faker'

export const fakeRegistrationFlag = fake<RegistrationFlag>(() => ({
  text: faker.lorem.sentence(),
  class: faker.datatype.uuid(),
}))

const fakeRiskLevelMeta = fake<RiskLevelMeta>(() => ({
  class: 'app-tag--dark-red',
  text: faker.random.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH']),
  index: faker.datatype.number(),
}))

function fakeRiskSubject(): string {
  return faker.random.arrayElement(['Children', 'Staff', 'Public', 'Known Adult', 'Prisoners'])
}

const fakeRoshRisk = fake<RoshRisk>(() => ({
  meta: fakeRiskLevelMeta(),
  riskTo: fakeRiskSubject(),
  level: fakeEnum(RiskLevel),
}))

const fakeFlatRiskToSelf = fake<FlatRiskToSelf>(() => ({
  notes: { current: faker.lorem.sentence(), previous: faker.lorem.sentence() },
  value: faker.lorem.sentence(),
}))

export const fakeRisks = fake<Risks>((options, partial = {}) => ({
  community: {
    level: fakeRiskLevelMeta(),
    risks: partial.community?.risks?.map(x => fakeRoshRisk(x)) || [fakeRoshRisk(), fakeRoshRisk()],
    riskLevels: {
      [RiskLevel.VeryHigh]: fakeRandomArray(fakeRiskSubject),
      [RiskLevel.High]: fakeRandomArray(fakeRiskSubject),
      [RiskLevel.Medium]: fakeRandomArray(fakeRiskSubject),
      [RiskLevel.Low]: fakeRandomArray(fakeRiskSubject),
    },
    riskImminence: faker.lorem.sentence(),
    natureOfRisk: faker.lorem.sentence(),
    whoIsAtRisk: faker.lorem.sentence(),
  },
  self: {
    harm: fakeFlatRiskToSelf(),
    custody: fakeFlatRiskToSelf(),
    vulnerability: fakeFlatRiskToSelf(),
  },
}))
