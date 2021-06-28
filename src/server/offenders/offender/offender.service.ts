import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { CommunityApiService, OffenderDetail } from '../../community-api'
import { ContactDetailsViewModel, PersonalDetailsViewModel } from './offender-view-model'
import { getOffenderDisplayName } from '../../util'
import { getAddressLines } from '../../util/address'

@Injectable()
export class OffenderService {
  constructor(private readonly community: CommunityApiService) {}

  async getOffenderDetail(crn: string): Promise<OffenderDetail> {
    const { data } = await this.community.offender.getOffenderDetailByCrnUsingGET({ crn })
    return data
  }

  getPersonalDetails(offender: OffenderDetail): {
    contactDetails: ContactDetailsViewModel
    personalDetails: PersonalDetailsViewModel
  } {
    // TODO render other addresses
    // TODO do something with no fixed abode addresses
    const address = offender.contactDetails.addresses?.find(x => x.status?.code === 'M')
    return {
      contactDetails: {
        address: getAddressLines(address),
        phoneNumbers: offender.contactDetails.phoneNumbers?.map(x => x.number).filter(x => x) || [],
        emailAddresses: offender.contactDetails.emailAddresses?.filter(x => x) || [],
      },
      personalDetails: {
        aliases: offender.offenderAliases?.map(getOffenderDisplayName).filter(x => x) || [],
        dateOfBirth: offender.dateOfBirth ? DateTime.fromISO(offender.dateOfBirth) : null,
        name: getOffenderDisplayName(offender),
        disabilities: offender.offenderProfile?.disabilities
          ?.filter(x => !x.endDate || DateTime.fromISO(x.endDate) > DateTime.now())
          .map(x => x.disabilityType?.description)
          .filter(x => x),
        preferredLanguage: offender.offenderProfile?.offenderLanguages?.primaryLanguage,
      },
    }
  }
}
