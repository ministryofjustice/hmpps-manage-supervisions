import { ConvictionRequirementDetail } from './conviction.types'
import { fake } from '../../util/util.fake'
import * as faker from 'faker'
import { DateTime } from 'luxon'

export const fakeConvictionRequirementDetail = fake<ConvictionRequirementDetail, { isActive?: boolean }>(
  ({ isActive = true } = {}) => ({
    id: faker.datatype.number(),
    length: `${faker.datatype.number()} days`,
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
