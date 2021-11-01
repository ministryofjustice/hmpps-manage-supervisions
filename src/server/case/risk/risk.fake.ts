import {
  AssessRisksAndNeedsApiStatus,
  CriminogenicNeed,
  CriminogenicNeeds,
  FlatRiskToSelf,
  RiskLevel,
  RiskLevelMeta,
  RiskRegistration,
  RiskRegistrationDetails,
  RiskRegistrations,
  Risks,
  RoshRisk,
} from './risk.types'
import { fake, fakeEnum, fakeRandomArray } from '../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { GovUkUiTagColour } from '../../util/govuk-ui'

export const fakeRegistrationFlag = fake<RiskRegistration>(() => ({
  text: faker.lorem.sentence(),
  notes: faker.lorem.sentence(),
  reviewDue: DateTime.fromJSDate(faker.date.past()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
  links: { view: faker.internet.url() },
}))

export const fakeRegistrationDetails = fake<RiskRegistrationDetails>(() => ({
  text: faker.lorem.sentence(),
  notes: faker.lorem.sentence(),
  reviewDue: DateTime.fromJSDate(faker.date.past()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
  added: DateTime.fromJSDate(faker.date.past()).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
  addedBy: faker.name.findName(),
  typeInfo: {
    description: faker.lorem.sentence(),
    purpose: faker.lorem.sentence(),
    furtherInformation: faker.lorem.sentence(),
    suggestedReviewFrequency: faker.datatype.number(),
    termination: faker.lorem.sentence(),
  },
  links: {
    view: faker.internet.url(),
    viewLastReview: faker.internet.url(),
    updateNotes: faker.internet.url(),
    delete: faker.internet.url(),
    addReview: faker.internet.url(),
  },
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
  status: AssessRisksAndNeedsApiStatus.Available,
  community: {
    level: fakeRiskLevelMeta(),
    risks: partial.community?.risks?.map(fakeRoshRisk) || [fakeRoshRisk(), fakeRoshRisk()],
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
    current: ['suicide'],
    previous: [],
    harm: fakeFlatRiskToSelf(),
    custody: fakeFlatRiskToSelf(),
    vulnerability: fakeFlatRiskToSelf(),
  },
  assessedOn: DateTime.fromJSDate(faker.date.past()),
}))

export const fakeCriminogenicNeed = fake<CriminogenicNeed>(() => ({
  name: faker.company.bs(),
  date: DateTime.fromJSDate(faker.date.past()),
}))

export const fakeCriminogenicNeeds = fake<CriminogenicNeeds>((options, partial = {}) => ({
  status: AssessRisksAndNeedsApiStatus.Available,
  needs: partial.needs?.map(x => fakeCriminogenicNeed(x)) || [fakeCriminogenicNeed()],
}))
