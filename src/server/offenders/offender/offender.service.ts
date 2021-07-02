import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import {
  Address,
  CommunityApiService,
  OffenderDetail,
  OffenderLanguages,
  PhoneNumberType,
  WellKnownAddressTypes,
} from '../../community-api'
import { ContactDetailsViewModel, PersonalDetailsViewModel } from './offender-view-model'
import { getDisplayName, isActiveDateRange, titleCase } from '../../util'
import { getAddressLines } from '../../util/address'

function getLanguageSummary(languages: OffenderLanguages) {
  if (!languages.primaryLanguage) {
    return languages.requiresInterpreter ? 'Interpreter required' : null
  }

  return [languages.primaryLanguage, languages.requiresInterpreter ? '(interpreter required)' : null]
    .filter(x => x)
    .join(' ')
}

@Injectable()
export class OffenderService {
  constructor(private readonly community: CommunityApiService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  async getPersonalDetails(offender: OffenderDetail): Promise<{
    contactDetails: ContactDetailsViewModel
    personalDetails: PersonalDetailsViewModel
  }> {
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

    function getAddressType(address: Address): 'previous' | 'current' {
      if (!isActiveDateRange({ startDate: address.from, endDate: address.to })) {
        // addresses with an end date in the past are previous addresses
        return 'previous'
      }
      // previous addresses can also be classified by status regardless of end date...
      return address.status.code === WellKnownAddressTypes.Previous ? 'previous' : 'current'
    }

    const { current, previous } = offender.contactDetails.addresses?.reduce(
      (agg, x) => agg[getAddressType(x)].push(x) && agg,
      { current: [] as Address[], previous: [] as Address[] },
    ) || { current: [], previous: [] }

    const main = current.find(x => x.status?.code === WellKnownAddressTypes.Main)
    const { offenderLanguages, religion, sexualOrientation, genderIdentity, selfDescribedGender } =
      offender.offenderProfile
    return {
      contactDetails: {
        address: main && {
          lines: getAddressLines(main),
          phone: main.telephoneNumber,
          type: main.type && `${main.type.description} (${main.typeVerified ? 'verified' : 'not verified'})`,
          startDate: DateTime.fromISO(main.from),
        },
        otherAddresses: {
          current: current.filter(x => x !== main).length,
          previous: previous.length,
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
        lastUpdated: main && DateTime.fromISO(main.lastUpdatedDatetime), // TODO determine logic for aggregating dates across addresses
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
