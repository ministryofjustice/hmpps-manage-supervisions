import { Test } from '@nestjs/testing'
import { OffenderService } from './offender.service'
import { MockCommunityApiModule, MockCommunityApiService } from '../../community-api/community-api.mock'
import { CommunityApiService } from '../../community-api'
import {
  fakeAddress,
  fakeDisability,
  fakeOffenderDetail,
  fakePhoneNumber,
} from '../../community-api/community-api.fake'
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

  it('gets offender personal details', () => {
    const offender = fakeOffenderDetail({
      firstName: 'Some',
      surname: 'Offender',
      dateOfBirth: '2001-05-06',
      contactDetails: {
        addresses: [
          fakeAddress({
            addressNumber: '123',
            buildingName: 'Some building',
            streetName: 'Some street',
            town: 'Some town',
            county: 'Some county',
            postcode: 'Some postcode',
            noFixedAbode: false,
            status: { code: 'M' },
          }),
        ],
        phoneNumbers: [fakePhoneNumber({ number: '0123456789' }), fakePhoneNumber({ number: '9876543210' })],
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
      },
      offenderAliases: [
        { firstName: 'A1', middleNames: ['A2'], surname: 'A3' },
        { firstName: 'B1', middleNames: ['B2'], surname: 'B3' },
      ],
      offenderProfile: {
        offenderLanguages: { primaryLanguage: 'English' },
        disabilities: [
          fakeDisability({ disabilityType: { description: 'Some disability' } }),
          fakeDisability({ disabilityType: { description: 'Some other disability' } }),
        ],
      },
    })
    const observed = subject.getPersonalDetails(offender)
    expect(observed).toEqual({
      contactDetails: {
        address: ['123 Some building Some street', 'Some town', 'Some county', 'Some postcode'],
        phoneNumbers: ['0123456789', '9876543210'],
        emailAddresses: ['some.email@address.com', 'some.other.email@address.com'],
      } as ContactDetailsViewModel,
      personalDetails: {
        name: 'Some Offender',
        preferredLanguage: 'English',
        dateOfBirth: DateTime.fromObject({ year: 2001, month: 5, day: 6 }),
        aliases: ['A1 A2 A3', 'B1 B2 B3'],
        disabilities: ['Some disability', 'Some other disability'],
      } as PersonalDetailsViewModel,
    })
  })
})
