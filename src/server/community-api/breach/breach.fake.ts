import { fake } from '../../util/util.fake'
import { BreachSummary } from './breach.types'
import { DateTime } from 'luxon'
import * as faker from 'faker'

export const fakeBreachSummary = fake<BreachSummary>((options, { active = true } = {}) => {
  return {
    active,
    startDate: DateTime.fromJSDate(faker.date.past()),
    endDate: active ? null : DateTime.fromJSDate(faker.date.past()),
    outcome: active ? null : faker.random.arrayElement(['Breach not proven', 'Breach not proven', 'Breach withdrawn']),
    status: faker.random.arrayElement(['Breach Initiated', 'Breach Information Pack Requested', 'Warrant Issued']),
  }
})
