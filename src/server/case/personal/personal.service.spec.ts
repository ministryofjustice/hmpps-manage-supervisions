import { Test } from '@nestjs/testing'
import { match } from 'sinon'
import { PersonalService } from './personal.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { OffenderDetail, PersonalCircumstance, PhoneNumberType } from '../../community-api/client'
import {
  fakeIsoDate,
  fakeOffenderDetail,
  fakePersonalCircumstance,
  fakePersonalContact,
} from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { DateTime } from 'luxon'
import { AddressDetail, GetPersonalDetailsResult, PersonalContactDetail } from './personal.types'
import * as faker from 'faker'
import { fakePersonalCircumstanceDetail, fakePersonalContactDetail } from './personal.fake'
import { MockLinksModule } from '../../common/links/links.mock'
import { BreadcrumbType, UtmMedium } from '../../common/links'
import { CommunityApiService, WellKnownAddressTypes } from '../../community-api'
import { fakeCriminogenicNeeds } from '../risk/risk.fake'
import { DeepPartial } from '../../app.types'

describe('PersonalService', () => {
  let subject: PersonalService
  let community: MockCommunityApiService

  let offender: OffenderDetail

  const expectedMainAddress: AddressDetail = {
    name: 'Main address – Since 1 January 2021',
    lines: ['123 Some building Some street', 'Some town', 'Some county', 'Some postcode'],
    phone: '9876543210',
    type: 'Approved premises (verified)',
    startDate: DateTime.fromISO('2021-01-01'),
    endDate: null,
    notes: 'some address notes',
    active: true,
    main: true,
    lastUpdated: DateTime.fromISO('2021-01-02T12:00:00'),
    status: 'Main address',
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PersonalService],
      imports: [MockCommunityApiModule.register(), MockLinksModule],
    }).compile()

    subject = module.get(PersonalService)
    community = module.get(CommunityApiService)

    offender = fakeOffenderDetail({
      firstName: 'Some',
      surname: 'Offender',
      preferredName: 'Some preferred name',
      previousSurname: 'Some previous name',
      dateOfBirth: '2001-05-06',
      gender: 'Male',
      contactDetails: {
        addresses: [
          {
            addressNumber: '123',
            buildingName: 'Some building',
            streetName: 'Some street',
            town: 'Some town',
            county: 'Some county',
            postcode: 'Some postcode',
            noFixedAbode: false,
            status: { code: WellKnownAddressTypes.Main, description: 'Main address' },
            telephoneNumber: '9876543210',
            from: '2021-01-01',
            type: { description: 'Approved premises' },
            typeVerified: true,
            lastUpdatedDatetime: '2021-01-02T12:00:00',
            notes: 'some address notes',
          },
          { status: { code: WellKnownAddressTypes.Secondary } }, // active, secondary
          { status: { code: WellKnownAddressTypes.Previous } }, // active, previous
          { status: { code: WellKnownAddressTypes.Main }, to: fakeIsoDate('past') }, // inactive, main
        ],
        phoneNumbers: [
          { number: '0123456789', type: PhoneNumberType.Mobile },
          { number: '9876543210', type: PhoneNumberType.Telephone },
        ],
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
      },
      offenderAliases: [
        { firstName: 'A1', middleNames: ['A2'], surname: 'A3' },
        { firstName: 'B1', middleNames: ['B2'], surname: 'B3' },
      ],
      offenderProfile: {
        offenderLanguages: { primaryLanguage: 'English', requiresInterpreter: true },
        disabilities: [
          {
            startDate: '2021-02-01',
            notes: 'Some notes',
            disabilityType: { description: 'Some disability' },
            provisions: [],
            lastUpdatedDateTime: '2021-04-01',
          },
          {
            startDate: '2021-02-02',
            notes: 'Some other notes',
            disabilityType: { description: 'Some other disability' },
            provisions: [{ startDate: '2021-02-03', provisionType: { description: 'Some provision' } }],
            lastUpdatedDateTime: '2021-03-01',
          },
          {
            startDate: '2020-02-03',
            endDate: '2020-02-04',
            notes: 'Some expired notes',
            disabilityType: { description: 'Some expired disability' },
            provisions: [],
            lastUpdatedDateTime: '2021-02-01',
          },
        ],
      },
    })
  })

  it('gets address detail', () => {
    const observed = subject.getAddressDetail(offender)
    expect(observed.mainAddress).toEqual(expectedMainAddress)
    expect(observed.otherAddresses).toHaveLength(1)
    expect(observed.previousAddresses).toHaveLength(2)
  })

  it('gets personal contacts', async () => {
    const personalContact = fakePersonalContact({
      personalContactId: 1000,
      firstName: 'Pippa',
      otherNames: null,
      surname: 'Wade',
      relationship: 'Wife',
      relationshipType: { description: 'Next of Kin' },
      notes: 'Some notes',
      mobileNumber: '0123456789',
      emailAddress: 'example@example.com',
      startDate: '2019-10-05',
      address: {
        addressNumber: '53327',
        buildingName: null,
        streetName: 'Movies Conn Ridges',
        town: 'Mafaldaville',
        county: 'Avon',
        postcode: 'ABC 123',
      },
    })
    community.offender.getAllOffenderPersonalContactsByCrnUsingGET
      .withArgs(match({ crn: 'some-crn' }))
      .resolves(fakeOkResponse([personalContact]))

    const observed = await subject.getPersonalContacts('some-crn')
    const links = MockLinksModule.of({ crn: 'some-crn', id: 1000 })
    expect(observed).toEqual([
      {
        id: 1000,
        type: 'Next of Kin',
        description: 'Pippa Wade – Wife',
        displayName: 'Pippa Wade',
        relationship: 'Wife',
        notes: 'Some notes',
        phone: '0123456789',
        startDate: DateTime.fromObject({ year: 2019, month: 10, day: 5 }),
        emailAddress: 'example@example.com',
        address: ['53327 Movies Conn Ridges', 'Mafaldaville', 'Avon', 'ABC 123'],
        links: {
          view: links.url(BreadcrumbType.PersonalContact),
          update: links.url(BreadcrumbType.ExitToDelius, {
            utm: {
              medium: UtmMedium.Personal,
              campaign: 'update-personal-contact',
              content: { personalContactId: 1000 },
            },
          }),
        },
      } as PersonalContactDetail,
    ])
  })

  it('gets offender personal details without disabilities', async () => {
    offender.offenderProfile.disabilities = null
    const observed = subject.getPersonalDetails(offender, [], [], null)
    expect(observed.personalDetails.disabilities).toEqual([])
  })

  it('gets offender personal details', () => {
    const personalContacts = [fakePersonalContactDetail()]
    const currentCircumstancesLastUpdated = DateTime.fromJSDate(faker.date.past())
    const disabilitiesLastUpdated = DateTime.fromISO('2021-04-01')
    const personalCircumstances = [
      fakePersonalCircumstanceDetail(
        { name: 'Relationship: Married / Civil partnership', lastUpdated: currentCircumstancesLastUpdated },
        { name: 'Some expired circumstance', endDate: DateTime.fromJSDate(faker.date.past()) },
      ),
    ]
    const needs = fakeCriminogenicNeeds()

    const observed = subject.getPersonalDetails(offender, personalContacts, personalCircumstances, needs)
    expect(observed).toEqual({
      contactDetails: {
        address: expectedMainAddress,
        otherAddresses: {
          current: 1,
          previous: 2,
        },
        phoneNumbers: {
          mobile: '0123456789',
          other: '9876543210',
        },
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
        personalContacts,
      },
      personalDetails: {
        name: 'Some Offender',
        dateOfBirth: DateTime.fromObject({ year: 2001, month: 5, day: 6 }),
        preferredName: 'Some preferred name',
        aliases: ['A1 A2 A3', 'B1 B2 B3'],
        previousName: 'Some previous name',
        preferredLanguage: 'English (interpreter required)',
        currentCircumstances: ['Relationship: Married / Civil partnership'],
        currentCircumstancesLastUpdated,
        disabilities: ['Some disability: No adjustments', 'Some other disability: Some provision'],
        disabilitiesLastUpdated,
        criminogenicNeeds: needs,
        religion: 'Christian',
        sex: 'Male',
        genderIdentity: 'Prefer to self-describe',
        selfDescribedGender: 'Jedi',
        genderSummary: 'Prefer to self-describe: Jedi',
        sexualOrientation: 'Bisexual',
      },
    } as GetPersonalDetailsResult)
  })

  it('gets offender personal details without address', async () => {
    const offender = fakeOffenderDetail({
      contactDetails: { addresses: [] },
    })
    community.offender.getAllOffenderPersonalContactsByCrnUsingGET.resolves(fakeOkResponse([]))
    community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET.resolves(
      fakeOkResponse({
        personalCircumstances: [],
      }),
    )
    const observed = subject.getPersonalDetails(offender, [], [], null)
    expect(observed.contactDetails.address).toBeFalsy()
  })

  it('gets disabilities', () => {
    const observed = subject.getDisabilities(offender)
    expect(observed).toEqual([
      {
        active: true,
        adjustments: [
          {
            endDate: null,
            name: 'Some provision',
            startDate: DateTime.fromISO('2021-02-03'),
          },
        ],
        endDate: null,
        name: 'Some other disability',
        notes: 'Some other notes',
        startDate: DateTime.fromISO('2021-02-02'),
        lastUpdatedDateTime: DateTime.fromISO('2021-03-01'),
      },
      {
        active: true,
        adjustments: [],
        endDate: null,
        name: 'Some disability',
        notes: 'Some notes',
        startDate: DateTime.fromISO('2021-02-01'),
        lastUpdatedDateTime: DateTime.fromISO('2021-04-01'),
      },
      {
        active: false,
        adjustments: [],
        startDate: DateTime.fromISO('2020-02-03'),
        endDate: DateTime.fromISO('2020-02-04'),
        notes: 'Some expired notes',
        name: 'Some expired disability',
        lastUpdatedDateTime: DateTime.fromISO('2021-02-01'),
      },
    ])
  })

  it('gets empty disabilities', () => {
    offender.offenderProfile.disabilities = null
    const observed = subject.getDisabilities(offender)
    expect(observed).toEqual([])
  })

  it('gets personal circumstances', async () => {
    havingPersonalCircumstances({
      startDate: '2021-07-08',
      endDate: '2021-07-09',
      evidenced: true,
      notes: 'Some personal circumstance notes',
      personalCircumstanceType: {
        description: 'Relationship',
      },
      personalCircumstanceSubType: {
        description: 'Married / Civil partnership',
      },
      createdDatetime: '2021-07-08T12:00:00',
      lastUpdatedDatetime: '2021-07-08T13:00:00',
    })

    const observed = await subject.getPersonalCircumstances('some-crn')

    expect(observed).toEqual([
      {
        name: 'Relationship: Married / Civil partnership',
        type: 'Relationship',
        subType: 'Married / Civil partnership',
        previousCircumstanceCount: 0,
        startDate: DateTime.fromObject({ year: 2021, month: 7, day: 8 }),
        endDate: DateTime.fromObject({ year: 2021, month: 7, day: 9 }),
        verified: true,
        notes: 'Some personal circumstance notes',
        lastUpdated: DateTime.fromObject({ year: 2021, month: 7, day: 8, hour: 13 }),
      },
    ])
  })

  function havingPersonalCircumstances(...partials: DeepPartial<PersonalCircumstance>[]) {
    const personalCircumstances = partials.map(fakePersonalCircumstance)
    community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET
      .withArgs(match({ crn: 'some-crn' }))
      .resolves(fakeOkResponse({ personalCircumstances }))
  }
})
