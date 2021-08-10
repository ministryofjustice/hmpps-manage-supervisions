import {
  AdditionalSentence,
  ComplianceActiveBreachSummary,
  ComplianceConvictionSummary,
  ComplianceDetails,
  CompliancePeriod,
  ComplianceQuantity,
  ComplianceStatus,
  ComplianceStatusAlertLevel,
  ConvictionDetails,
  ConvictionOffence,
  ConvictionRequirement,
  ConvictionRequirementDetail,
  ConvictionRequirementType,
} from './sentence.types'
import { fake } from '../../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fakeBreachSummary } from '../../../community-api/breach/breach.fake'

export const fakeConvictionOffence = fake<ConvictionOffence>(() => ({
  id: faker.datatype.uuid(),
  date: DateTime.fromJSDate(faker.date.past()),
  description: faker.company.bs(),
  category: faker.company.bs(),
  ogrsCategory: faker.company.bs(),
  additionalOffences: [faker.company.bs()],
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
      convictionDate: startDate.plus({ week: 1 }),
      elapsed: '1 month elapsed (of 12 months)',
      responsibleCourt: faker.address.streetAddress(),
      courtAppearance: faker.address.streetAddress(),
      additionalSentences: [fakeAdditionalSentence()],
    },
    requirements: partial.requirements?.map(r => fakeConvictionRequirement(r)) || [fakeConvictionRequirement()],
  }
})

export const fakeComplianceConvictionSummary = fake<ComplianceConvictionSummary>((options, partial = {}) => {
  const activeBreach = fakeBreachSummary({
    active: true,
    ...partial.activeBreach,
  }) as ComplianceActiveBreachSummary
  const previousBreaches = (partial.previousBreaches || [{}]).map(x => fakeBreachSummary({ active: false, ...x }))
  return {
    name: '12 month Community Order',
    startDate: DateTime.fromJSDate(faker.date.past()),
    length: '12 months',
    progress: '6 months',
    mainOffence: faker.company.bs(),
    inBreach: true,
    activeBreach,
    previousBreaches,
    allBreaches: [activeBreach, ...previousBreaches],
    lastRecentBreachEnd: DateTime.fromJSDate(faker.date.past()),
  }
})

function fakeComplianceQuantity(): ComplianceQuantity {
  return {
    name: `${faker.datatype.number({ min: 2, max: 10 })} ${faker.commerce.product()}s`,
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
    },
    status: {
      value: faker.random.arrayElement(Object.values(ComplianceStatus)),
      description: faker.company.bs(),
      alertLevel: faker.random.arrayElement(Object.values(ComplianceStatusAlertLevel)),
    },
    requirement: faker.company.bs(),
  },
  previous: [fakeComplianceConvictionSummary()],
  previousFrom: DateTime.fromJSDate(faker.date.past()),
}))
