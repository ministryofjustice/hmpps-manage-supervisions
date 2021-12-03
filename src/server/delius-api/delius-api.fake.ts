import * as faker from 'faker'
import { fakeCode, fakeCrn } from '../community-api/community-api.fake'
import { fake } from '../util/util.fake'
import { ContactDto } from './client'

export function fakeIsoDate(type: 'past' | 'recent' | 'soon' | 'future' = 'past'): string {
  return faker.date[type]().toISOString().substr(0, 10)
}

export const fakeContactDto = fake<ContactDto>(() => ({
  alert: faker.datatype.boolean(),
  date: fakeIsoDate('future'),
  description: faker.lorem.slug(3),
  endTime: faker.time.recent('abbr'),
  enforcement: fakeCode(),
  enforcementDescription: faker.lorem.slug(3),
  eventId: faker.datatype.number(),
  id: faker.datatype.number(),
  notes: faker.lorem.slug(3),
  offenderCrn: fakeCrn(),
  outcome: fakeCode(),
  outcomeDescription: faker.lorem.slug(3),
  provider: fakeCode(),
  providerDescription: faker.lorem.slug(3),
  rarActivity: faker.datatype.boolean(),
  requirementId: faker.datatype.number(),
  sensitive: faker.datatype.boolean(),
  staff: faker.datatype.uuid(),
  staffFirstName: faker.name.firstName(),
  staffLastName: faker.name.lastName(),
  startTime: faker.time.recent('abbr'),
  team: fakeCode(),
  teamDescription: faker.lorem.slug(3),
  type: faker.datatype.uuid(),
  typeDescription: faker.lorem.slug(3),
}))
