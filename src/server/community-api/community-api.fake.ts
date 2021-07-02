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
  Address,
  Disability,
  OffenderAlias,
  PhoneNumber,
  Conviction,
  Offence,
  Requirement,
} from './client'
import { merge } from 'lodash'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fake } from '../util/util.fake'
import { Paginated } from './types'
import {
  RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE,
  RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE,
  WellKnownAddressTypes,
} from './well-known'

export function fakeIsoDate(type: 'past' | 'recent' | 'soon' | 'future' = 'past'): string {
  return faker.date[type]().toISOString().substr(0, 10)
}

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

export const fakeAddress = fake<Address>(() => ({
  from: fakeIsoDate(),
  notes: faker.company.bs(),
  addressNumber: faker.datatype.number().toString(),
  streetName: faker.address.streetName(),
  buildingName: faker.commerce.department(),
  town: faker.address.city(),
  county: faker.address.county(),
  postcode: faker.address.zipCode(),
  status: {
    code: WellKnownAddressTypes.Main,
    description: 'Main',
  },
  noFixedAbode: false,
  telephoneNumber: faker.phone.phoneNumber(),
  latestAssessmentDate: faker.date.past().toISOString(),
  type: {
    code: faker.random.alphaNumeric(3),
    description: faker.company.bs(),
  },
  typeVerified: true,
  lastUpdatedDatetime: faker.date.past().toISOString(),
  createdDatetime: faker.date.past().toISOString(),
}))

export const fakePhoneNumber = fake<PhoneNumber>(() => ({
  type: PhoneNumberType.Mobile,
  number: faker.phone.phoneNumber(),
}))

export const fakeDisability = fake<Disability>((options, partial) => ({
  disabilityId: faker.datatype.number(),
  disabilityType: {
    code: faker.random.alphaNumeric(3).toUpperCase(),
    description: faker.company.bs(),
  },
  startDate: fakeIsoDate(),
  notes: faker.company.bs(),
  provisions: partial?.provisions || [
    {
      provisionId: faker.datatype.number(),
      notes: faker.lorem.sentence(),
      startDate: fakeIsoDate(),
      provisionType: {
        code: faker.random.alphaNumeric(3),
        description: faker.company.bs(),
      },
    },
  ],
}))

export const fakeOffenderAlias = fake<OffenderAlias>(() => ({
  firstName: faker.name.firstName(),
  surname: faker.name.lastName(),
}))

export const fakeOffenderDetail = fake<OffenderDetail>((options, partial) => ({
  offenderId: faker.datatype.number(),
  otherIds: { crn: 'some-crn' },
  activeProbationManagedSentence: true,
  firstName: faker.name.firstName(),
  surname: faker.name.lastName(),
  preferredName: faker.name.findName(),
  previousSurname: faker.name.lastName(),
  gender: faker.random.arrayElement(['Male', 'Female']),
  dateOfBirth: fakeIsoDate(),
  contactDetails: {
    addresses: partial?.contactDetails?.addresses?.map(fakeAddress) || [fakeAddress()],
    phoneNumbers: partial?.contactDetails?.phoneNumbers?.map(fakePhoneNumber) || [fakePhoneNumber()],
    emailAddresses: partial?.contactDetails?.emailAddresses || [faker.internet.email()],
  },
  offenderProfile: {
    offenderLanguages: {
      primaryLanguage: faker.address.country(),
      requiresInterpreter: true,
    },
    disabilities: partial?.offenderProfile?.disabilities?.map(fakeDisability) || [fakeDisability()],
    genderIdentity: 'Prefer to self-describe',
    selfDescribedGender: 'Jedi',
    sexualOrientation: 'Bisexual',
    religion: 'Christian',
  },
  offenderAliases: partial?.offenderAliases || [fakeOffenderAlias()],
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
          startDate: fakeIsoDate(),
          endDate: fakeIsoDate('future'),
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

export const fakeOffence = fake<Offence>(() => ({
  offenceId: faker.datatype.uuid(),
  mainOffence: true,
  detail: {
    code: faker.random.alphaNumeric(5),
    description: faker.commerce.product(),
    mainCategoryCode: faker.random.alphaNumeric(3),
    mainCategoryDescription: faker.commerce.productDescription(),
    mainCategoryAbbreviation: faker.lorem.word(),
    ogrsOffenceCategory: faker.commerce.department(),
    subCategoryCode: faker.random.alphaNumeric(2),
    subCategoryDescription: faker.commerce.productName(),
    form20Code: faker.random.alphaNumeric(2),
  },
  offenceDate: fakeIsoDate(),
  offenceCount: faker.datatype.number({ min: 1, max: 10 }),
  offenderId: faker.datatype.number(),
  createdDatetime: faker.date.past().toISOString(),
  lastUpdatedDatetime: faker.date.past().toISOString(),
}))

export const fakeConviction = fake<Conviction, { additionalOffences?: number }>(({ additionalOffences = 0 }) => ({
  convictionId: faker.datatype.number(),
  index: faker.datatype.number().toString(),
  active: true,
  inBreach: faker.datatype.boolean(),
  convictionDate: fakeIsoDate(),
  referralDate: fakeIsoDate(),
  offences: [
    fakeOffence({ mainOffence: true }),
    ...[...Array(additionalOffences)].map(() => fakeOffence({ mainOffence: false })),
  ],
  sentence: {
    sentenceId: faker.datatype.number(),
    description: faker.commerce.productDescription(),
    originalLength: 12,
    originalLengthUnits: 'Months',
    defaultLength: 12,
    lengthInDays: 364,
    expectedSentenceEndDate: fakeIsoDate('future'),
    startDate: fakeIsoDate('recent'),
    sentenceType: {
      code: faker.random.alphaNumeric(2),
      description: faker.commerce.productMaterial(),
    },
  },
  latestCourtAppearanceOutcome: {
    code: faker.random.alphaNumeric(3),
    description: faker.commerce.productMaterial(),
  },
  responsibleCourt: {
    courtId: faker.datatype.number(),
    code: faker.random.alphaNumeric(5),
    selectable: true,
    courtName: faker.address.streetAddress(),
    telephoneNumber: faker.phone.phoneNumber(),
    fax: faker.phone.phoneNumber(),
    buildingName: faker.lorem.words(3),
    town: faker.address.city(),
    county: faker.address.county(),
    postcode: faker.address.zipCode(),
    country: faker.address.country(),
    courtTypeId: faker.datatype.number(),
    createdDatetime: faker.date.past().toISOString(),
    lastUpdatedDatetime: faker.date.past().toISOString(),
    probationAreaId: faker.datatype.number(),
    probationArea: {
      code: faker.random.alphaNumeric(3),
      description: faker.address.city(),
    },
    courtType: {
      code: faker.random.alphaNumeric(3),
      description: faker.commerce.productMaterial(),
    },
  },
  courtAppearance: {
    courtAppearanceId: faker.datatype.number(),
    appearanceDate: fakeIsoDate(),
    courtCode: faker.random.alphaNumeric(5),
    courtName: faker.address.streetAddress(),
    appearanceType: {
      code: faker.random.alphaNumeric(2),
      description: faker.commerce.productMaterial(),
    },
    crn: faker.random.alphaNumeric(7),
  },
}))

export const fakeRequirement = fake<Requirement>(() => ({
  requirementId: faker.datatype.number(),
  length: faker.datatype.number({ min: 1, max: 100 }),
  lengthUnit: 'Days',
  active: true,
  startDate: fakeIsoDate(),
  expectedStartDate: fakeIsoDate(),
  expectedEndDate: fakeIsoDate('future'),
  requirementNotes: faker.lorem.sentence(),
  requirementTypeMainCategory: { code: RAR_REQUIREMENT_TYPE_MAIN_CATEGORY_CODE, description: 'RAR category' },
  requirementTypeSubCategory: { code: RAR_REQUIREMENT_SUB_TYPE_CATEGORY_CODE, description: 'RAR sub category' },
}))
