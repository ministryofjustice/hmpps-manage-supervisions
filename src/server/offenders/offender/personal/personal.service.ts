import { Injectable } from '@nestjs/common'
import { groupBy, maxBy, orderBy } from 'lodash'
import {
  Address,
  CommunityApiService,
  OffenderDetail,
  OffenderLanguages,
  PhoneNumberType,
  WellKnownAddressTypes,
} from '../../../community-api'
import { getDisplayName, isActiveDateRange, titleCase, sentenceCase } from '../../../util'
import { DateTime } from 'luxon'
import { AddressDetail, GetAddressDetailResult, GetPersonalDetailsResult } from './personal.types'

function getLanguageSummary(languages: OffenderLanguages) {
  if (!languages.primaryLanguage) {
    return languages.requiresInterpreter ? 'Interpreter required' : null
  }

  return [languages.primaryLanguage, languages.requiresInterpreter ? '(interpreter required)' : null]
    .filter(x => x)
    .join(' ')
}

function getAddressViewModel(address: Address): AddressDetail {
  const main = address.status.code === WellKnownAddressTypes.Main
  let status = sentenceCase(address.status.description)
  if (!status.endsWith('address')) {
    status += ' address'
  }
  const startDate = DateTime.fromISO(address.from)
  const endDate = address.to ? DateTime.fromISO(address.to) : null
  const dateRange = endDate
    ? [startDate, endDate].map(x => x.toFormat('d MMMM yyyy')).join(' to ')
    : `Since ${startDate.toFormat('d MMMM yyyy')}`
  return {
    name: `${status} - ${dateRange}`,
    // addresses with an end date in the past are previous addresses
    // but previous addresses can also be classified by status regardless of end date...
    active:
      isActiveDateRange({ startDate: address.from, endDate: address.to }) &&
      address.status.code !== WellKnownAddressTypes.Previous,
    main,
    lines: (address.noFixedAbode
      ? ['No fixed abode', address.type?.description]
      : [
          [address.addressNumber, address.buildingName, address.streetName].filter(x => x).join(' '),
          address.district,
          address.town,
          address.county,
          address.postcode,
        ]
    ).filter(x => x),
    phone: address.telephoneNumber,
    type: address.type && `${address.type.description} (${address.typeVerified ? 'verified' : 'not verified'})`,
    startDate,
    endDate,
    notes: address.notes,
    status,
    lastUpdated: DateTime.fromISO(address.lastUpdatedDatetime),
  }
}

@Injectable()
export class PersonalService {
  constructor(private readonly community: CommunityApiService) {}

  getAddressDetail(offender: OffenderDetail): GetAddressDetailResult {
    const { current = [], previous = [] } = groupBy(offender.contactDetails.addresses?.map(getAddressViewModel), x =>
      x.active ? 'current' : 'previous',
    )

    // there shouldn't be multiple main addresses but if there are then take the latest
    const mainAddress = maxBy(
      current.filter(x => x.main),
      x => x.startDate.toJSDate(),
    )

    return {
      mainAddress,
      otherAddresses: orderBy(
        current.filter(x => x !== mainAddress),
        x => x.startDate.toJSDate(),
        'desc',
      ),
      previousAddresses: orderBy(previous, [x => x.startDate.toJSDate(), x => x.endDate?.toJSDate()], ['desc', 'desc']),
    }
  }

  async getPersonalDetails(offender: OffenderDetail): Promise<GetPersonalDetailsResult> {
    const crn = offender.otherIds.crn
    const [
      { data: personalContacts },
      {
        data: { personalCircumstances },
      },
    ] = await Promise.all([
      this.community.offender.getAllOffenderPersonalContactsByCrnUsingGET({ crn }),
      this.community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET({ crn }),
    ])

    const addresses = this.getAddressDetail(offender)

    const { offenderLanguages, religion, sexualOrientation, genderIdentity, selfDescribedGender } =
      offender.offenderProfile
    return {
      contactDetails: {
        address: addresses.mainAddress,
        otherAddresses: {
          current: addresses.otherAddresses.length,
          previous: addresses.previousAddresses.length,
        },
        phoneNumbers: {
          mobile: offender.contactDetails.phoneNumbers?.find(x => x.type === PhoneNumberType.Mobile)?.number,
          other: offender.contactDetails.phoneNumbers?.find(x => x.type !== PhoneNumberType.Mobile)?.number,
        },
        emailAddresses: offender.contactDetails.emailAddresses?.filter(x => x).sort() || [],
        personalContacts: personalContacts.filter(isActiveDateRange).map(x => ({
          link: `/offender/${crn}/personal-contacts/${x.personalContactId}`,
          type: x.relationshipType?.description,
          name: [getDisplayName(x), titleCase(x.relationship)].filter(x => x).join(' - '),
        })),
        lastUpdated: addresses.mainAddress?.lastUpdated, // TODO determine logic for aggregating dates across addresses
      },
      personalDetails: {
        name: getDisplayName(offender),
        dateOfBirth: offender.dateOfBirth ? DateTime.fromISO(offender.dateOfBirth) : null,
        preferredName: offender.preferredName,
        aliases:
          offender.offenderAliases
            ?.map(x => getDisplayName(x))
            .filter(x => x)
            .sort() || [],
        previousName: offender.previousSurname,
        preferredLanguage: getLanguageSummary(offenderLanguages),
        currentCircumstances: personalCircumstances
          .filter(isActiveDateRange)
          .map(x => `${x.personalCircumstanceType.description}: ${x.personalCircumstanceSubType.description}`)
          .sort(),
        disabilities: offender.offenderProfile.disabilities
          ?.filter(isActiveDateRange)
          .map(x =>
            [
              x.disabilityType.description,
              x.provisions?.length ? x.provisions.map(p => p.provisionType.description).join(', ') : 'None',
            ].join(': '),
          )
          .sort(),
        religion,
        sex: offender.gender,
        genderIdentity,
        selfDescribedGender,
        sexualOrientation,
      },
    }
  }
}
