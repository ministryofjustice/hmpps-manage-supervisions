import { ConvictionDetails, ConvictionOffence } from './sentence.types'
import { fake } from '../../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'

export const fakeConvictionOffence = fake<ConvictionOffence>(() => ({
  id: faker.datatype.uuid(),
  date: DateTime.fromJSDate(faker.date.past()),
  description: faker.company.bs(),
}))

export const fakeConvictionDetails = fake<ConvictionDetails>(() => {
  const startDate = DateTime.fromJSDate(faker.date.past())
  return {
    previousConvictions: {
      count: faker.datatype.number(),
      lastEnded: DateTime.fromJSDate(faker.date.past()),
      link: faker.internet.url(),
    },
    mainOffence: fakeConvictionOffence(),
    additionalOffences: [fakeConvictionOffence(), fakeConvictionOffence()],
    sentence: {
      description: faker.company.bs(),
      length: '12 months',
      startDate,
      endDate: startDate.plus({ years: 1 }),
      convictionDate: startDate.plus({ week: 1 }),
      elapsed: '1 month elapsed (of 12 months)',
      responsibleCourt: faker.address.streetAddress(),
      courtAppearance: faker.address.streetAddress(),
    },
    requirement: { length: `${faker.datatype.number()} days` },
  }
})
