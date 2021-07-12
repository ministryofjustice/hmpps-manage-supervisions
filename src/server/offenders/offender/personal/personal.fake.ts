import * as faker from 'faker'
import { fake } from '../../../util/util.fake'
import { DateTime } from 'luxon'
import {
  AddressDetail,
  ContactDetailsViewModel,
  DisabilityDetail,
  GetAddressDetailResult,
  PersonalCircumstanceDetail,
  PersonalContactDetail,
  PersonalDetailsViewModel,
} from './personal.types'

function fakeFullName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`
}

export const fakeAddressDetail = fake<AddressDetail>((partial = {}) => {
  const active = partial.active === undefined ? faker.datatype.boolean() : partial.active
  return {
    name: faker.lorem.sentence(),
    lines: [faker.address.streetAddress(), faker.address.city(), faker.address.zipCode()],
    phone: faker.phone.phoneNumber(),
    type: 'Approved Premises',
    startDate: DateTime.fromJSDate(faker.date.past()),
    endDate: active ? null : DateTime.fromJSDate(faker.date.recent()),
    lastUpdated: DateTime.fromJSDate(faker.date.past()),
    active,
    main: false,
    notes: faker.lorem.sentence(),
    status: faker.company.bs(),
  }
})

export const fakeGetAddressDetailResult = fake<GetAddressDetailResult>(() => ({
  mainAddress: fakeAddressDetail({ main: true, active: true }),
  otherAddresses: [fakeAddressDetail({ main: false, active: true })],
  previousAddresses: [fakeAddressDetail({ main: false, active: false })],
}))

export const fakePersonalContactDetail = fake<PersonalContactDetail>(() => ({
  id: faker.datatype.number(),
  description: `${faker.name.findName()} - Father`,
  type: 'Family Member',
  link: faker.internet.url(),
  startDate: DateTime.fromJSDate(faker.date.past()),
  phone: faker.phone.phoneNumber(),
  notes: faker.lorem.sentence(),
  emailAddress: faker.internet.email(),
  address: [faker.address.streetAddress(), faker.address.city(), faker.address.zipCode()],
  displayName: faker.name.findName(),
  relationship: 'Father',
}))

export const fakeContactDetailsViewModel = fake<ContactDetailsViewModel>(() => ({
  address: fakeAddressDetail({ main: true, active: true }),
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
  personalContacts: [fakePersonalContactDetail()],
  lastUpdated: DateTime.fromJSDate(faker.date.past()),
}))

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

export const fakeDisabilityDetail = fake<DisabilityDetail>(({ active = faker.datatype.boolean() } = {}) => {
  return {
    name: faker.company.bs(),
    active,
    startDate: DateTime.fromJSDate(faker.date.past()),
    endDate: active ? null : DateTime.fromJSDate(faker.date.recent()),
    notes: faker.lorem.sentence(),
    adjustments: [
      {
        name: faker.company.bs(),
        startDate: DateTime.fromJSDate(faker.date.past()),
        notes: faker.lorem.sentence(),
      },
    ],
  }
})

export const fakePersonalCircumstanceDetail = fake<PersonalCircumstanceDetail>(() => ({
  name: faker.company.bs(),
  startDate: DateTime.fromJSDate(faker.date.past()),
  endDate: DateTime.fromJSDate(faker.date.future()),
  verified: faker.datatype.boolean(),
  notes: faker.lorem.lines(),
  subType: faker.lorem.slug(10),
  type: faker.lorem.slug(10),
  lastUpdated: DateTime.fromJSDate(faker.date.past()),
}))
