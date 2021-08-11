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
  Registration,
  PersonalCircumstance,
  PersonalContact,
  OffenderDetailSummary,
  AdditionalSentence,
  Nsi,
  ProbationArea,
  Team,
} from './client'
import { merge } from 'lodash'
import * as faker from 'faker'
import { DateTime } from 'luxon'
import { fake } from '../util/util.fake'
import { Paginated } from './types'
import { WellKnownAddressTypes } from './well-known'

export function fakeCrn() {
  const n = faker.datatype.number({ min: 1, max: 999999 }).toString()
  return faker.random.alpha().toUpperCase() + n.padStart(n.length - 6, '0')
}

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

export const fakeAddress = fake<Address>((options, partial = {}) => {
  const code = partial.status?.code || WellKnownAddressTypes.Main
  const [description] = Object.entries(WellKnownAddressTypes).find(([, v]) => v === code)

  const base = {
    from: fakeIsoDate(),
    notes: faker.company.bs(),
    status: { code, description },
    lastUpdatedDatetime: faker.date.past().toISOString(),
    createdDatetime: faker.date.past().toISOString(),
  }

  if (partial.noFixedAbode) {
    return { ...base, noFixedAbode: true }
  }

  return {
    ...base,
    addressNumber: faker.datatype.number().toString(),
    streetName: faker.address.streetName(),
    buildingName: faker.commerce.department(),
    town: faker.address.city(),
    county: faker.address.county(),
    postcode: faker.address.zipCode(),
    noFixedAbode: false,
    telephoneNumber: faker.phone.phoneNumber(),
    latestAssessmentDate: faker.date.past().toISOString(),
    type: {
      code: 'A02',
      description: 'Approved premises',
    },
    typeVerified: true,
  }
})

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

export const fakeOffenderDetail = fake<OffenderDetail>((options, partial = {}) => ({
  offenderId: faker.datatype.number(),
  otherIds: { crn: fakeCrn(), pncNumber: 'some-prn' },
  activeProbationManagedSentence: true,
  firstName: faker.name.firstName(),
  surname: faker.name.lastName(),
  preferredName: faker.name.findName(),
  previousSurname: faker.name.lastName(),
  gender: faker.random.arrayElement(['Male', 'Female']),
  dateOfBirth: fakeIsoDate(),
  contactDetails: {
    addresses: partial.contactDetails?.addresses?.map(fakeAddress) || [fakeAddress()],
    phoneNumbers: partial.contactDetails?.phoneNumbers?.map(fakePhoneNumber) || [
      fakePhoneNumber({ type: PhoneNumberType.Mobile }),
      fakePhoneNumber({ type: PhoneNumberType.Telephone }),
    ],
    emailAddresses: partial.contactDetails?.emailAddresses || [faker.internet.email()],
  },
  offenderProfile: {
    offenderLanguages: {
      primaryLanguage: faker.address.country(),
      requiresInterpreter: true,
    },
    disabilities: partial.offenderProfile?.disabilities?.map(fakeDisability) || [fakeDisability()],
    genderIdentity: 'Prefer to self-describe',
    selfDescribedGender: 'Jedi',
    sexualOrientation: 'Bisexual',
    religion: 'Christian',
  },
  offenderAliases: partial.offenderAliases?.map(p => fakeOffenderAlias(p)) || [fakeOffenderAlias()],
  offenderManagers: [{ team: { code: faker.datatype.uuid() } }],
}))

export const fakeOffenderDetailSummary = fake<OffenderDetailSummary>((options, partial) => ({
  offenderId: faker.datatype.number(),
  otherIds: { crn: fakeCrn(), pncNumber: 'some-prn' },
  activeProbationManagedSentence: true,
  firstName: faker.name.firstName(),
  surname: faker.name.lastName(),
  preferredName: faker.name.findName(),
  previousSurname: faker.name.lastName(),
  gender: faker.random.arrayElement(['Male', 'Female']),
  dateOfBirth: fakeIsoDate(),
  contactDetails: {
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

export const fakePersonalCircumstance = fake<PersonalCircumstance>(() => ({
  startDate: fakeIsoDate(),
  evidenced: faker.datatype.boolean(),
  notes: faker.lorem.lines(),
  offenderId: faker.datatype.number(),
  personalCircumstanceId: faker.datatype.number(),
  personalCircumstanceSubType: {
    code: faker.random.alphaNumeric(3).toUpperCase(),
    description: faker.company.bs(),
  },
  personalCircumstanceType: {
    code: faker.random.alphaNumeric(3).toUpperCase(),
    description: faker.company.bs(),
  },
  createdDatetime: faker.date.past().toISOString(),
  lastUpdatedDatetime: faker.date.recent().toISOString(),
}))

export const fakePersonalContact = fake<PersonalContact>(() => ({
  personalContactId: faker.datatype.number(),
  title: faker.name.title(),
  firstName: faker.name.firstName(),
  otherNames: faker.name.middleName(),
  surname: faker.name.lastName(),
  previousSurname: faker.name.lastName(),
  relationship: faker.random.arrayElement([
    'Wife',
    'Husband',
    'Mother',
    'Father',
    'Daughter',
    'Son',
    'Auntie',
    'Uncle',
    'Cousin',
  ]),
  gender: faker.random.arrayElement(['Female', 'Male']),
  relationshipType: {
    code: 'NK',
    description: faker.random.arrayElement(['Next of Kin', 'Family Member']),
  },
  startDate: fakeIsoDate(),
  createdDatetime: faker.date.past().toISOString(),
  lastUpdatedDatetime: faker.date.past().toISOString(),
  emailAddress: faker.internet.email(),
  mobileNumber: faker.phone.phoneNumber(),
  notes: faker.lorem.sentence(),
  address: {
    addressNumber: faker.datatype.number().toString(),
    streetName: faker.address.streetName(),
    buildingName: faker.commerce.department(),
    town: faker.address.city(),
    county: faker.address.county(),
    postcode: faker.address.zipCode(),
    telephoneNumber: faker.phone.phoneNumber(),
  },
}))

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
    rarActivity: faker.datatype.boolean(),
    requirement: {
      isRar: faker.datatype.boolean(),
      requirementId: faker.datatype.number(),
      isActive: faker.datatype.boolean(),
    },
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
      lastUpdatedDateTime: date.toISO(),
      lastUpdatedByUser: { forenames: faker.name.firstName(), surname: faker.name.lastName() },
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

export const fakeAdditionalSentence = fake<AdditionalSentence>((options, partial = {}) => {
  return {
    additionalSentenceId: faker.datatype.number(),
    type: {
      code: faker.random.alphaNumeric(3).toUpperCase(),
      description: faker.random.arrayElement(['Disqualified from Driving', 'Fine']),
    },
    notes: faker.lorem.sentence(),
    length: partial.amount ? null : faker.datatype.number({ min: 1, max: 4 }) * 6,
    amount: partial.length ? null : faker.datatype.number({ min: 100, max: 1000 }),
  }
})

export const fakeConviction = fake<Conviction>((options, { active = true, inBreach = false, offences } = {}) => {
  return {
    convictionId: faker.datatype.number(),
    index: faker.datatype.number().toString(),
    active,
    convictionDate: fakeIsoDate(),
    referralDate: fakeIsoDate(),
    offences: offences || [fakeOffence({ mainOffence: true })],
    inBreach,
    failureToComplyCount: inBreach ? 3 : 0,
    breachEnd: inBreach ? fakeIsoDate('future') : null,
    sentence: {
      sentenceId: faker.datatype.number(),
      description: faker.random.arrayElement(['ORA Community Order', 'CJA Community Order']),
      originalLength: 12,
      originalLengthUnits: 'Months',
      defaultLength: 12,
      lengthInDays: 364,
      expectedSentenceEndDate: active ? fakeIsoDate('future') : fakeIsoDate('past'),
      startDate: active ? fakeIsoDate('recent') : fakeIsoDate('past'),
      terminationDate: active ? null : fakeIsoDate('recent'),
      terminationReason: active ? null : faker.random.arrayElement(['Auto-terminated', 'Revoked']),
      sentenceType: {
        code: faker.random.alphaNumeric(2),
        description: faker.random.arrayElement(['ORA Community Order', 'CJA Community Order']),
      },
      additionalSentences: [],
      failureToComplyLimit: 3,
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
      crn: fakeCrn(),
    },
  }
})

export const fakeRequirement = fake<Requirement>(() => ({
  requirementId: faker.datatype.number(),
  length: faker.datatype.number({ min: 1, max: 100 }),
  lengthUnit: 'Days',
  active: true,
  startDate: fakeIsoDate(),
  expectedStartDate: fakeIsoDate(),
  expectedEndDate: fakeIsoDate('future'),
  requirementNotes: faker.lorem.sentence(),
  requirementTypeMainCategory: { code: 'F', description: 'RAR category' },
  requirementTypeSubCategory: { code: faker.random.alphaNumeric(5), description: faker.commerce.productMaterial() },
}))

export const fakeRegistration = fake<Registration>((partial: DeepPartial<Registration> = {}) => {
  return merge(
    {
      riskColour: faker.random.arrayElement(['Red', 'Amber', 'Green', 'White']),
      type: {
        code: faker.random.alphaNumeric(4),
        description: faker.commerce.productMaterial(),
      },
    } as Registration,
    partial,
  )
})

export const fakeProbationArea = fake<ProbationArea>(() => ({
  probationAreaId: faker.datatype.number(),
  code: faker.random.alphaNumeric(3).toUpperCase(),
  description: faker.address.streetAddress(),
  organisation: {
    code: faker.random.alphaNumeric(4).toUpperCase(),
    description: faker.company.companyName(),
  },
}))

export const fakeTeam = fake<Team>(() => ({
  code: faker.random.alphaNumeric(6).toUpperCase(),
  description: faker.company.companyName(),
  startDate: fakeIsoDate(),
  localDeliveryUnit: {
    code: faker.random.alphaNumeric(6).toUpperCase(),
    description: faker.address.city(),
  },
  teamType: {
    code: faker.random.alphaNumeric(6).toUpperCase(),
    description: faker.company.bs(),
  },
  district: {
    code: faker.random.alphaNumeric(6).toUpperCase(),
    description: faker.address.city(),
  },
  borough: {
    code: faker.random.alphaNumeric(6).toUpperCase(),
    description: faker.address.city(),
  },
}))

export const fakeNsi = fake<Nsi>((options, { active = true } = {}) => {
  return {
    nsiId: faker.datatype.number(),
    nsiType: {
      code: faker.random.alphaNumeric(3).toUpperCase(),
      description: faker.company.bs(),
    },
    nsiSubType: {
      code: faker.random.alphaNumeric(5).toUpperCase(),
      description: faker.company.bs(),
    },
    nsiStatus: {
      code: faker.random.alphaNumeric(5).toUpperCase(),
      description: faker.random.arrayElement([
        'Warrant Issued',
        'Warrant Executed',
        'Breach Proven - Committed to Custody',
        'Breach Not Proven',
      ]),
    },
    statusDateTime: faker.date.past().toISOString(),
    referralDate: fakeIsoDate(),
    lengthUnit: faker.random.arrayElement(['Months', 'Days']),
    active,
    nsiManagers: [
      {
        probationArea: fakeProbationArea(),
        team: fakeTeam(),
        staff: fakeStaffDetails(),
        startDate: fakeIsoDate(),
      },
    ],
    intendedProvider: fakeProbationArea(),
    notes: faker.lorem.sentence(),
    length: faker.datatype.number({ min: 1, max: 12 }),
    softDeleted: false,
    actualStartDate: fakeIsoDate(),
    actualEndDate: active ? null : fakeIsoDate(),
  }
})
