import { Test } from '@nestjs/testing'
import { OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { CommunityApiService, PhoneNumberType, WellKnownAddressTypes } from '../../community-api'
import { fakeIsoDate, fakeOffenderDetail } from '../../community-api/community-api.fake'
import { fakeOkResponse } from '../../common/rest/rest.fake'
import { ContactDetailsViewModel, PersonalDetailsViewModel } from './offender-view-model'
import { DateTime } from 'luxon'

describe('OffenderService', () => {
  let subject: OffenderService
  let community: MockCommunityApiService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OffenderService],
      imports: [MockCommunityApiModule.register()],
    }).compile()

    subject = module.get(OffenderService)
    community = module.get(CommunityApiService)
  })

  it('gets offender detail', async () => {
    const offender = fakeOffenderDetail()
    const stub = community.offender.getOffenderDetailByCrnUsingGET.resolves(fakeOkResponse(offender))
    const observed = await subject.getOffenderDetail('some-crn')
    expect(observed).toBe(offender)
    expect(stub.getCall(0).firstArg).toEqual({ crn: 'some-crn' })
  })

  it('gets offender personal details', async () => {
    const offender = fakeOffenderDetail({
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
            status: { code: WellKnownAddressTypes.Main },
            telephoneNumber: '9876543210',
            from: '2021-01-01',
            type: { description: 'Approved premises' },
            typeVerified: true,
            lastUpdatedDatetime: '2021-01-02T12:00:00',
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
          { disabilityType: { description: 'Some disability' }, provisions: [] },
          {
            disabilityType: { description: 'Some other disability' },
            provisions: [{ provisionType: { description: 'Some provision' } }],
          },
        ],
      },
    })

    community.offender.getAllOffenderPersonalContactsByCrnUsingGET.resolves(fakeOkResponse([]))
    community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET.resolves(
      fakeOkResponse({
        personalCircumstances: [],
      }),
    )

    const observed = await subject.getPersonalDetails(offender)
    expect(observed).toEqual({
      contactDetails: {
        address: {
          lines: ['123 Some building Some street', 'Some town', 'Some county', 'Some postcode'],
          phone: '9876543210',
          type: 'Approved premises (verified)',
          startDate: DateTime.fromISO('2021-01-01'),
        },
        otherAddresses: {
          current: 1,
          previous: 2,
        },
        phoneNumbers: {
          mobile: '0123456789',
          other: '9876543210',
        },
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
        personalContacts: [],
        lastUpdated: DateTime.fromISO('2021-01-02T12:00:00'),
      } as ContactDetailsViewModel,
      personalDetails: {
        name: 'Some Offender',
        dateOfBirth: DateTime.fromObject({ year: 2001, month: 5, day: 6 }),
        preferredName: 'Some preferred name',
        aliases: ['A1 A2 A3', 'B1 B2 B3'],
        previousName: 'Some previous name',
        preferredLanguage: 'English (interpreter required)',
        currentCircumstances: [],
        disabilities: ['Some disability: None', 'Some other disability: Some provision'],
        religion: 'Christian',
        sex: 'Male',
        genderIdentity: 'Prefer to self-describe',
        selfDescribedGender: 'Jedi',
        sexualOrientation: 'Bisexual',
      } as PersonalDetailsViewModel,
    })
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
    const observed = await subject.getPersonalDetails(offender)
    expect(observed.contactDetails.address).toBeFalsy()
  })
})
