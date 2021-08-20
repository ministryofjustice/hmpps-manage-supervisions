import {
  FlatRiskToSelf,
  RiskLevelMeta,
  RegistrationFlag,
  Risks,
  RoshRisk,
  RiskLevel,
  RiskRegistrations,
} from './risk.types'
import { fake, fakeEnum, fakeRandomArray } from '../../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../../util/govuk-ui'

export const fakeRegistrationFlag = fake<RegistrationFlag>(() => ({
  text: faker.lorem.sentence(),
  notes: faker.lorem.sentence(),
  link: faker.internet.url(),
  reviewDue: DateTime.fromJSDate(faker.date.past()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
}))

export const fakeRiskRegistrations = fake<RiskRegistrations>(() => ({
  active: [fakeRegistrationFlag()],
  inactive: [fakeRegistrationFlag()],
}))

const fakeRiskLevelMeta = fake<RiskLevelMeta>(() => ({
  colour: fakeEnum(GovUkUiTagColour),
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
