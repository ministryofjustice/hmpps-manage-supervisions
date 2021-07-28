import { Injectable } from '@nestjs/common'
import { groupBy, maxBy, orderBy } from 'lodash'
import {
  Address,
  AddressSummary,
  OffenderDetail,
  OffenderLanguages,
  PhoneNumberType,
} from '../../../community-api/client'
import { getDisplayName, isActiveDateRange, sentenceCase, titleCase } from '../../../util'
import { DateTime } from 'luxon'
import {
  AddressDetail,
  DisabilityDetail,
  GetAddressDetailResult,
  GetPersonalDetailsResult,
  PersonalCircumstanceDetail,
  PersonalContactDetail,
} from './personal.types'
import { BreadcrumbType, LinksService } from '../../../common/links'
import { CommunityApiService, WellKnownAddressTypes } from '../../../community-api'

function getLanguageSummary(languages: OffenderLanguages) {
  if (!languages.primaryLanguage) {
    return languages.requiresInterpreter ? 'Interpreter required' : null
  }

  return [languages.primaryLanguage, languages.requiresInterpreter ? '(interpreter required)' : null]
    .filter(x => x)
    .join(' ')
}

function getAddressLines(address: AddressSummary): string[] {
  return [
    [address.addressNumber, address.buildingName, address.streetName].filter(x => x).join(' '),
    address.district,
    address.town,
    address.county,
    address.postcode,
  ].filter(x => x)
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
    lines: address.noFixedAbode
      ? ['No fixed abode', address.type?.description].filter(x => x)
      : getAddressLines(address),
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
  constructor(private readonly community: CommunityApiService, private readonly links: LinksService) {}

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

  getDisabilities(offender: OffenderDetail): DisabilityDetail[] {
    if (!offender.offenderProfile.disabilities) {
      return []
    }

    return orderBy(
      offender.offenderProfile.disabilities.map(x => {
        const startDate = DateTime.fromISO(x.startDate)
        const endDate = x.endDate ? DateTime.fromISO(x.endDate) : null
        return {
          name: x.disabilityType.description,
          active: isActiveDateRange({ startDate, endDate }),
          startDate,
          endDate,
          notes: x.notes,
          adjustments:
            x.provisions
              ?.map(provision => ({
                startDate: DateTime.fromISO(provision.startDate),
                endDate: provision.finishDate ? DateTime.fromISO(provision.finishDate) : null,
                name: provision.provisionType.description,
                notes: provision.notes,
              }))
              .filter(isActiveDateRange) || [],
        }
      }),
      [x => x.startDate.toJSDate(), x => x.endDate?.toJSDate()],
      ['desc', 'desc'],
    )
  }

  async getPersonalCircumstances(crn: string): Promise<PersonalCircumstanceDetail[]> {
    const {
      data: { personalCircumstances = [] },
    } = await this.community.personalCircumstances.getOffenderPersonalCircumstancesByCrnUsingGET({ crn })

    return orderBy(
      personalCircumstances.map(x => ({
        name: `${x.personalCircumstanceType.description}: ${x.personalCircumstanceSubType.description}`,
        type: x.personalCircumstanceType.description,
        subType: x.personalCircumstanceSubType.description,
        startDate: DateTime.fromISO(x.startDate),
        endDate: x.endDate && DateTime.fromISO(x.endDate),
        verified: x.evidenced || false,
        notes: x.notes,
        lastUpdated: DateTime.fromISO(x.lastUpdatedDatetime),
      })),
      [x => x.startDate.toJSDate(), x => x.endDate?.toJSDate()],
      ['desc', 'desc'],
    )
  }

  async getPersonalContacts(crn: string): Promise<PersonalContactDetail[]> {
    const { data: personalContacts = [] } = await this.community.offender.getAllOffenderPersonalContactsByCrnUsingGET({
      crn,
    })

    return orderBy(
      personalContacts.filter(isActiveDateRange).map(x => {
        const displayName = getDisplayName(x)
        return {
          id: x.personalContactId,
          description: [displayName, titleCase(x.relationship)].filter(x => x).join(' – '),
          type: x.relationshipType?.description,
          relationship: x.relationship,
          displayName,
          address: x.address && getAddressLines(x.address),
          link: this.links.getUrl(BreadcrumbType.PersonalContact, {
            crn,
            id: x.personalContactId,
          }),
          emailAddress: x.emailAddress,
          startDate: DateTime.fromISO(x.startDate),
          endDate: x.endDate && DateTime.fromISO(x.endDate),
          notes: x.notes,
          phone: x.mobileNumber,
        }
      }),
      [x => x.type, x => x.displayName],
    )
  }

  getPersonalDetails(
    offender: OffenderDetail,
    personalContacts: PersonalContactDetail[],
    personalCircumstances: PersonalCircumstanceDetail[],
  ): GetPersonalDetailsResult {
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
        personalContacts,
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
        currentCircumstances: personalCircumstances.filter(isActiveDateRange).map(x => x.name),
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
