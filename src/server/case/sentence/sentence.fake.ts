import {
  AdditionalSentence,
  ComplianceDetails,
  CompliancePeriod,
  ComplianceQuantity,
  ComplianceStatus,
  ComplianceStatusAlertLevel,
  ConvictionAdditionalOffence,
  ConvictionDetails,
  ConvictionOffence,
  ConvictionRequirement,
  ConvictionRequirementDetail,
  ConvictionRequirementType,
  PreviousConvictionSummary,
} from './sentence.types'
import { fake } from '../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fakeComplianceConvictionSummary } from '../compliance/compliance.fake'

export const fakeConvictionAdditionalOffence = fake<ConvictionAdditionalOffence>(() => ({
  name: faker.company.bs(),
  code: faker.datatype.number().toString(),
  category: faker.company.bs(),
  date: DateTime.fromJSDate(faker.date.past()),
}))

export const fakeConvictionOffence = fake<ConvictionOffence>((options, partial = {}) => ({
  id: faker.datatype.uuid(),
  date: DateTime.fromJSDate(faker.date.past()),
  description: faker.company.bs(),
  category: faker.company.bs(),
  code: faker.datatype.number().toString(),
  additionalOffences: partial.additionalOffences?.map(x => fakeConvictionAdditionalOffence(x)) || [
    fakeConvictionAdditionalOffence(),
  ],
}))

export const fakeAdditionalSentence = fake<AdditionalSentence>(() => ({
  name: faker.company.bs(),
  notes: faker.lorem.sentence(),
  length: faker.datatype.number(),
  value: faker.datatype.number(),
}))

const fakeConvictionRequirementDetail = fake<ConvictionRequirementDetail, { isActive?: boolean }>(
  ({ isActive = true } = {}) => ({
    length: `${faker.datatype.number()} days`,
    progress: `${faker.datatype.number()} days`,
    startDate: {
      value: DateTime.fromJSDate(faker.date.past()),
      expected: faker.datatype.boolean(),
    },
    endDate: isActive
      ? null
      : {
          value: DateTime.fromJSDate(faker.date.past()),
          expected: faker.datatype.boolean(),
        },
    notes: faker.lorem.sentence(),
    terminationReason: isActive ? faker.company.bs() : null,
  }),
)

export const fakeConvictionRequirement = fake<ConvictionRequirement, { isActive?: boolean }>((options, partial) => {
  const type = partial?.type || faker.random.arrayElement(Object.values(ConvictionRequirementType))

  switch (type) {
    case ConvictionRequirementType.Aggregate:
      return {
        type,
        name: faker.company.bs(),
        isRar: faker.datatype.boolean(),
        requirements: [fakeConvictionRequirementDetail({}, options)],
      }
    case ConvictionRequirementType.Unit:
      return {
        type,
        name: faker.company.bs(),
        isRar: faker.datatype.boolean(),
        ...fakeConvictionRequirementDetail({}, options),
      }
  }
})

export const fakeConvictionDetails = fake<ConvictionDetails>((options, partial = {}) => {
  const startDate = DateTime.fromJSDate(faker.date.past())
  return {
    previousConvictions: {
      count: faker.datatype.number(),
      lastEnded: DateTime.fromJSDate(faker.date.past()),
      link: faker.internet.url(),
    },
    offence: fakeConvictionOffence(),
    sentence: {
      description: faker.company.bs(),
      length: '12 months',
      startDate,
      endDate: startDate.plus({ years: 1 }),
      convictionDate: startDate.plus({ weeks: 1 }),
      elapsed: '1 month elapsed (of 12 months)',
      responsibleCourt: faker.address.streetAddress(),
      courtAppearance: faker.address.streetAddress(),
      additionalSentences: [fakeAdditionalSentence()],
    },
    requirements: partial.requirements?.map(r => fakeConvictionRequirement(r)) || [fakeConvictionRequirement()],
  }
})

function fakeComplianceQuantity(): ComplianceQuantity {
  const value = faker.datatype.number({ min: 2, max: 10 })
  return {
    name: `${value} ${faker.commerce.product()}s`,
    value,
    link: faker.internet.url(),
  }
}

export const fakeComplianceDetails = fake<ComplianceDetails>(() => ({
  current: {
    ...fakeComplianceConvictionSummary(),
    period: faker.random.arrayElement(Object.values(CompliancePeriod)),
    appointments: {
      total: fakeComplianceQuantity(),
      complied: fakeComplianceQuantity(),
      acceptableAbsences: fakeComplianceQuantity(),
      failureToComply: fakeComplianceQuantity(),
      withoutAnOutcome: fakeComplianceQuantity(),
    },
    status: {
      value: faker.random.arrayElement(Object.values(ComplianceStatus)),
      description: faker.company.bs(),
      alertLevel: faker.random.arrayElement(Object.values(ComplianceStatusAlertLevel)),
      breachSuggested: faker.datatype.boolean(),
    },
    requirement: faker.company.bs(),
  },
  previous: {
    convictions: [fakeComplianceConvictionSummary()],
    dateFrom: DateTime.fromJSDate(faker.date.past()),
    totalBreaches: faker.datatype.number(),
  },
}))

export const fakePreviousConvictionSummary = fake<PreviousConvictionSummary>(() => ({
  name: faker.company.bs(),
  mainOffence: faker.company.bs(),
  endDate: DateTime.fromJSDate(faker.date.past()),
}))
