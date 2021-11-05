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
  ConvictionSentenceDetail,
  ConvictionSummary,
  PreviousConvictionSummary,
} from './sentence.types'
import { fake } from '../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fakeComplianceConvictionSummary } from '../compliance/compliance.fake'
import { ConvictionRequirement, ConvictionRequirementType } from '../../community-api'
import { fakeConvictionRequirementDetail } from '../../community-api/conviction/conviction.fake'

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

export const fakeConvictionSentenceDetail = fake<ConvictionSentenceDetail>(() => {
  const startDate = DateTime.fromJSDate(faker.date.past())
  return {
    description: faker.company.bs(),
    length: '12 months',
    startDate,
    endDate: startDate.plus({ years: 1 }),
    convictionDate: startDate.plus({ weeks: 1 }),
    elapsed: '1 month elapsed (of 12 months)',
    responsibleCourt: faker.address.streetAddress(),
    courtAppearance: faker.address.streetAddress(),
    additionalSentences: [fakeAdditionalSentence()],
  }
})

export const fakeConvictionDetails = fake<ConvictionDetails>((options, partial = {}) => {
  return {
    previousConvictions: {
      count: faker.datatype.number(),
      lastEnded: DateTime.fromJSDate(faker.date.past()),
      link: faker.internet.url(),
    },
    offence: fakeConvictionOffence(),
    sentence: fakeConvictionSentenceDetail(),
    requirements: partial.requirements?.map(r => fakeConvictionRequirement(r)) || [fakeConvictionRequirement()],
  }
})

function fakeComplianceQuantity(): ComplianceQuantity {
  const quantity = faker.datatype.number({ min: 2, max: 10 })
  return {
    content: `${quantity} ${faker.commerce.product()}s`,
    quantity,
    link: faker.internet.url(),
    linkContent: `${quantity} ${faker.commerce.product()}s`,
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
    requirement: {
      name: faker.company.bs(),
      requirementCount: faker.datatype.number(),
      totalRarCount: faker.datatype.number(),
    },
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
  link: faker.internet.url(),
}))

export const fakeConvictionSummary = fake<ConvictionSummary>(() => ({
  id: faker.datatype.number(),
  sentence: fakeConvictionSentenceDetail(),
}))
