import {
  AdditionalSentence,
  ConvictionDetails,
  ConvictionOffence,
  ConvictionRequirement,
  ConvictionRequirementDetail,
  ConvictionRequirementType,
} from './sentence.types'
import { fake } from '../../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'

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
