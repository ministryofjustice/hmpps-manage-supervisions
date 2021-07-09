import { DateTime } from 'luxon'
import { ViewModel } from '../../../common'

export interface ContactDetailsViewModel {
  address?: AddressDetail
  otherAddresses: {
    current: number
    previous: number
  }
  phoneNumbers: {
    mobile?: string
    other?: string
  }
  emailAddresses: string[]
  personalContacts: {
    link: string
    type: string
    name: string
  }[]
  lastUpdated?: DateTime
}

export interface PersonalDetailsViewModel {
  name: string
  dateOfBirth?: DateTime
  preferredName?: string
  aliases: string[]
  previousName?: string
  preferredLanguage?: string
  currentCircumstances: string[]
  disabilities: string[]
  religion?: string
  sex?: string
  genderIdentity?: string
  selfDescribedGender?: string
  sexualOrientation?: string
}

export interface GetPersonalDetailsResult {
  contactDetails: ContactDetailsViewModel
  personalDetails: PersonalDetailsViewModel
}

export interface AddressDetail {
  name: string
  active: boolean
  main: boolean
  lines: string[]
  status: string
  type?: string
  phone?: string
  startDate: DateTime
  endDate?: DateTime
  notes?: string
  lastUpdated: DateTime
}

export interface GetAddressDetailResult {
  mainAddress?: AddressDetail
  otherAddresses: AddressDetail[]
  previousAddresses: AddressDetail[]
}

export interface PersonalAddressesViewModel extends GetAddressDetailResult, ViewModel {
  displayName: string
}

export interface DisabilityDetail {
  name: string
  active: boolean
  startDate: DateTime
  endDate?: DateTime
  notes?: string
  adjustments: {
    name: string
    startDate: DateTime
    endDate?: DateTime
    notes?: string
  }[]
}

export interface PersonalDisabilitiesViewModel extends ViewModel {
  displayName: string
  disabilities: DisabilityDetail[]
}
