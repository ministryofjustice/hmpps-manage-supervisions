import * as faker from 'faker'
import { ContactDetailsViewModel, PersonalDetailsViewModel } from './offender-view-model'
import { fake } from '../../util/util.fake'
import { DateTime } from 'luxon'

export const fakeContactDetailsViewModel = fake<ContactDetailsViewModel>(() => ({
  address: [faker.address.streetAddress(), faker.address.city(), faker.address.zipCode()],
  phoneNumbers: [faker.phone.phoneNumber(), faker.phone.phoneNumber()],
  emailAddresses: [faker.internet.email(), faker.internet.email()],
}))

function fakeFullName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`
}

export const fakePersonalDetailsViewModel = fake<PersonalDetailsViewModel>(() => ({
  name: fakeFullName(),
  dateOfBirth: DateTime.fromJSDate(faker.date.past()),
  preferredLanguage: 'English',
  aliases: [fakeFullName(), fakeFullName()],
  disabilities: [faker.company.bs(), faker.company.bs()],
}))
