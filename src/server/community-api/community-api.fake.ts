import {
  AppointmentCreateResponse,
  AppointmentDetail,
  AppointmentOutcome,
  AppointmentType,
  AppointmentTypeOrderTypes,
  AppointmentTypeRequiresLocation,
  KeyValue,
  OffenderDetail,
  OfficeLocation,
  PhoneNumberType,
  PersonalCircumstances,
  StaffDetails,
  StaffHuman,
  ContactSummary,
  ContactType,
} from './client'
import { merge } from 'lodash'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fake } from '../util/util.fake'
import { Paginated } from './types'

export const fakeAppointmentType = fake<AppointmentType>(() => ({
  contactType: faker.datatype.uuid(),
  description: faker.company.bs(),
  orderTypes: [AppointmentTypeOrderTypes.Cja, AppointmentTypeOrderTypes.Cja],
  requiresLocation: faker.random.objectElement(AppointmentTypeRequiresLocation) as AppointmentTypeRequiresLocation,
}))

export const fakeAppointmentCreateResponse = fake<AppointmentCreateResponse>(() => ({
  appointmentId: faker.datatype.number(),
  appointmentStart: faker.date.future().toISOString(),
  appointmentEnd: faker.date.future().toISOString(),
  typeDescription: faker.lorem.slug(3),
  sensitive: faker.datatype.boolean(),
  type: faker.datatype.uuid(),
}))

export const fakeOffenderDetail = fake<OffenderDetail>(() => ({
  offenderId: faker.datatype.number(),
  activeProbationManagedSentence: true,
  firstName: faker.name.firstName(),
  surname: faker.name.lastName(),
  contactDetails: {
    phoneNumbers: [
      {
        type: PhoneNumberType.Mobile,
        number: faker.phone.phoneNumber(),
      },
    ],
  },
  offenderManagers: [{ team: { code: faker.datatype.uuid() } }],
}))

export const fakeOfficeLocation = fake<OfficeLocation>(() => ({
  code: faker.datatype.uuid(),
  buildingName: faker.name.firstName(),
  buildingNumber: faker.datatype.number({ min: 1, max: 999 }).toString(),
  streetName: faker.address.streetName(),
  townCity: faker.address.city(),
  county: faker.address.county(),
  postcode: faker.address.zipCode(),
  description: faker.address.streetAddress(),
}))

export function fakePersonalCircumstances(partial: DeepPartial<PersonalCircumstances> = {}): PersonalCircumstances {
  return merge(
    {
      personalCircumstances: [
        {
          startDate: faker.date.past().toISOString(),
          endDate: faker.date.future().toISOString(),
          evidenced: faker.datatype.boolean(),
          notes: faker.lorem.lines(),
          offenderId: faker.datatype.number(),
          personalCircumstanceId: faker.datatype.number(),
          personalCircumstanceSubType: {
            code: faker.lorem.slug(3),
            description: faker.lorem.slug(10),
          },
          personalCircumstanceType: {
            code: 'B',
            description: faker.lorem.slug(10),
          },
        },
      ],
    } as PersonalCircumstances,
    partial,
  )
}

export const fakeStaffDetails = fake<StaffDetails>(() => ({
  username: faker.lorem.slug(10),
  staffIdentifier: faker.datatype.number({ min: 1, max: 999 }),
  staffCode: faker.lorem.slug(10),
  email: faker.internet.email(),
}))

export const fakeAppointmentOutcome = fake<AppointmentOutcome>(() => ({
  code: faker.datatype.uuid(),
  attended: faker.datatype.boolean(),
  complied: faker.datatype.boolean(),
  description: faker.company.bs(),
  hoursCredited: faker.datatype.number(),
}))

export const fakeKeyValue = fake<KeyValue>(() => ({
  code: faker.datatype.uuid(),
  description: faker.company.bs(),
}))

export const fakeStaffHuman = fake<StaffHuman>(() => ({
  code: faker.datatype.uuid(),
  forenames: faker.name.firstName(),
  surname: faker.name.lastName(),
  unallocated: faker.datatype.boolean(),
}))

export interface FakeAppointmentDetailOptions {
  when?: 'past' | 'recent' | 'soon' | 'future'
}

export const fakeAppointmentDetail = fake<AppointmentDetail, FakeAppointmentDetailOptions>(({ when = 'recent' }) => {
  const date = DateTime.fromJSDate(faker.date[when]())
  return {
    appointmentId: faker.datatype.number(),
    appointmentStart: date.toISO(),
    appointmentEnd: date.plus({ hour: 1 }).toISO(),
    notes: faker.company.bs(),
    officeLocation: fakeOfficeLocation(),
    outcome: fakeAppointmentOutcome(),
    sensitive: faker.datatype.boolean(),
    type: fakeAppointmentType(),
    provider: fakeKeyValue(),
    team: fakeKeyValue(),
    staff: fakeStaffHuman(),
  }
})

export const fakeContactType = fake<ContactType>(() => ({
  code: faker.datatype.uuid(),
  description: faker.company.bs(),
  shortDescription: faker.company.bs(),
  appointment: faker.datatype.boolean(),
}))

export const fakeContactSummary = fake<ContactSummary, { when?: 'past' | 'recent' | 'soon' | 'future' }>(
  ({ when = 'recent' }) => {
    const date = DateTime.fromJSDate(faker.date[when]())
    return {
      contactId: faker.datatype.number(),
      contactStart: date.toISO(),
      contactEnd: date.plus({ hour: 1 }).toISO(),
      notes: faker.company.bs(),
      officeLocation: fakeOfficeLocation(),
      outcome: fakeAppointmentOutcome(),
      sensitive: faker.datatype.boolean(),
      type: fakeContactType(),
      provider: fakeKeyValue(),
      team: fakeKeyValue(),
      staff: fakeStaffHuman(),
    }
  },
)

export function fakePaginated<T>(content: T[], partial?: Partial<Omit<Paginated<T>, 'content'>>): Paginated<T> {
  return {
    totalElements: content.length,
    size: content.length,
    number: 0,
    first: true,
    last: false,
    totalPages: 1,
    ...partial,
    content,
  }
}
