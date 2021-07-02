import * as faker from 'faker'
import { ContactDetailsViewModel, PersonalDetailsViewModel } from './offender-view-model'
import { fake } from '../../util/util.fake'
import { DateTime } from 'luxon'

export const fakeContactDetailsViewModel = fake<ContactDetailsViewModel>(() => ({
  address: {
    lines: [faker.address.streetAddress(), faker.address.city(), faker.address.zipCode()],
    phone: faker.phone.phoneNumber(),
    type: 'Approved Premises',
    startDate: DateTime.fromJSDate(faker.date.past()),
  },
  phoneNumbers: {
    mobile: faker.phone.phoneNumber(),
    other: faker.phone.phoneNumber(),
  },
  emailAddresses: [faker.internet.email(), faker.internet.email()],
  otherAddresses: {
    current: faker.datatype.number({ min: 1, max: 10 }),
    previous: faker.datatype.number({ min: 1, max: 10 }),
    link: faker.internet.url(),
  },
  personalContacts: [
    {
      name: `${faker.name.findName()} - Father`,
      type: 'Family Member',
      link: faker.internet.url(),
    },
  ],
  lastUpdated: DateTime.fromJSDate(faker.date.past()),
}))

function fakeFullName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`
}

export const fakePersonalDetailsViewModel = fake<PersonalDetailsViewModel>(() => ({
  name: fakeFullName(),
  dateOfBirth: DateTime.fromJSDate(faker.date.past()),
  preferredName: fakeFullName(),
  aliases: [fakeFullName(), fakeFullName()],
  previousName: fakeFullName(),
  preferredLanguage: 'English (interpreter required)',
  currentCircumstances: [
    'Employment: Full-time employed (30 or more hours per week)',
    'Accommodation: Friends/Family (settled)',
  ],
  disabilities: ['Mental Illness: Flex refreshment breaks', 'Visual Impairment: Colour/visibility marking'],
  religion: 'Christian',
  sex: 'Male',
  genderIdentity: 'Prefer to self-describe',
  selfDescribedGender: 'Jedi',
  sexualOrientation: 'Bisexual',
}))
