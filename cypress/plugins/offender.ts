import { OffenderDetail, OffenderDetailSummary, PhoneNumberType } from '../../src/server/community-api/client'
import { fakeOffenderDetail } from '../../src/server/community-api/community-api.fake'
import { omit } from 'lodash'
import { SeedFn } from './wiremock'
import { DeepPartial } from '../../src/server/app.types'

export const CRN = 'X009923'
export const OFFENDER_ID = 2500011641

export const OFFENDER: DeepPartial<OffenderDetail> = {
  offenderId: OFFENDER_ID,
  otherIds: { crn: CRN, pncNumber: '2012/123400000F' },
  title: 'Dr',
  firstName: 'Liz',
  middleNames: ['Danger'],
  surname: 'Haggis',
  previousSurname: 'Scotland',
  preferredName: 'Bob',
  dateOfBirth: '1980-06-10',
  gender: 'Female',
  contactDetails: {
    addresses: [
      {
        from: '2015-07-16',
        noFixedAbode: false,
        addressNumber: '1',
        streetName: 'High Street',
        buildingName: null,
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S10 1AG',
        notes: 'Sleeping on sofa, https://gov.uk',
        telephoneNumber: '0123456789',
        status: {
          code: 'M',
          description: 'Main',
        },
        type: {
          code: 'A02',
          description: 'Approved Premises',
        },
        typeVerified: true,
        latestAssessmentDate: '2021-06-11T12:00:00',
        createdDatetime: '2021-06-11T13:00:00',
        lastUpdatedDatetime: '2021-06-11T14:00:00',
      },
      {
        from: '2001-07-16',
        to: '2015-07-16',
        noFixedAbode: true,
        notes: null,
        status: {
          code: 'M',
          description: 'Main',
        },
        type: {
          code: 'T',
          description: 'Tent',
        },
      },
      {
        from: '2016-01-08',
        noFixedAbode: false,
        addressNumber: '24',
        buildingName: 'The Mill',
        streetName: 'Sherbourne Street',
        town: 'Birmingham',
        county: 'West Midlands',
        postcode: 'B16 8TP',
        notes: null,
        telephoneNumber: null,
        status: {
          code: 'S',
          description: 'Secondary',
        },
        type: null,
        typeVerified: false,
        createdDatetime: '2018-07-09T13:58:58',
        lastUpdatedDatetime: '2018-08-01T02:02:07',
      },
    ],
    phoneNumbers: [
      {
        type: PhoneNumberType.Mobile,
        number: '07734 111992',
      },
      {
        type: PhoneNumberType.Telephone,
        number: '01234 111222',
      },
    ],
    emailAddresses: ['example@example.com', 'example2@example2.com'],
  },
  offenderProfile: {
    offenderLanguages: {
      primaryLanguage: 'Bengali',
      requiresInterpreter: true,
    },
    religion: 'Christian',
    genderIdentity: 'Prefer to self-describe',
    selfDescribedGender: 'Jedi',
    sexualOrientation: 'Bisexual',
    disabilities: [
      {
        disabilityType: { description: 'Other' },
        startDate: '2021-02-01',
        notes: null,
        provisions: [
          {
            startDate: '2021-05-10',
            provisionType: { description: 'Other' },
            notes: 'Other',
          },
        ],
        lastUpdatedDateTime: '2021-09-01',
      },
      {
        disabilityType: { description: 'Learning Difficulties' },
        startDate: '2021-02-01',
        notes: null,
        provisions: [
          {
            startDate: '2021-05-10',
            provisionType: { description: 'Other' },
            notes: 'Extra tuition',
          },
        ],
        lastUpdatedDateTime: '2021-08-01',
      },
      {
        disabilityType: { description: 'Speech Impairment' },
        startDate: '2021-03-01',
        notes: 'Talks like a pirate',
        provisions: null,
        lastUpdatedDateTime: '2021-07-01',
      },
      {
        disabilityType: { description: 'Dyslexia' },
        startDate: '2020-04-01',
        endDate: '2020-05-01',
        notes: null,
        provisions: null,
        lastUpdatedDateTime: '2021-06-01',
      },
    ],
  },
  offenderAliases: [
    { firstName: 'Dylan', surname: 'Meyer' },
    { firstName: 'Romario', surname: 'Montgomery' },
  ],
  offenderManagers: [
    {
      staff: { code: 'CRSSTAFF1' },
      team: { code: 'N07UAT' },
      probationArea: { code: 'N07' },
    },
  ],
}

export function offender(partial: DeepPartial<OffenderDetail> = {}): SeedFn {
  return context => {
    const detail = fakeOffenderDetail([OFFENDER, partial])
    const summary = omit(detail, [
      'contactDetails.addresses',
      'offenderAliases',
      'offenderManagers',
      'restrictionMessage',
      'exclusionMessage',
      'currentTier',
    ]) as OffenderDetailSummary

    const crn = detail.otherIds.crn
    context.client.community.get(`/secure/offenders/crn/${crn}`).returns(summary)
    context.client.community.get(`/secure/offenders/crn/${crn}/all`).returns(detail)
  }
}
