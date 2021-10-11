import { DateTime } from 'luxon'
import { ViewModel } from '../../common'

export interface PersonalViewModel extends ViewModel {
  displayName: string
  links: {
    toDelius: string
  }
}

export interface PersonalContactDetail {
  id: number
  description: string
  type: string
  startDate?: DateTime
  endDate?: DateTime
  relationship?: string
  displayName: string
  address?: string[]
  phone?: string
  emailAddress?: string
  notes?: string
  link: string
}

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
  personalContacts: PersonalContactDetail[]
  lastUpdated?: DateTime
}

export interface PersonalCircumstanceDetail {
  name: string
  type: string
  subType: string
  startDate: DateTime
  endDate?: DateTime
  verified: boolean
  notes?: string
  lastUpdated: DateTime
}

export interface PersonalDetailsViewModel {
  name: string
  dateOfBirth?: DateTime
  preferredName?: string
  aliases: string[]
  previousName?: string
  preferredLanguage?: string
  currentCircumstances: string[]
  currentCircumstancesLastUpdated: DateTime
  disabilities: string[]
  disabilitiesLastUpdated: DateTime
  criminogenicNeeds: string[]
  religion?: string
  sex?: string
  genderIdentity?: string
  selfDescribedGender?: string
  genderSummary?: string
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

export interface PersonalAddressesViewModel extends GetAddressDetailResult, PersonalViewModel {}

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

export interface PersonalDisabilitiesViewModel extends PersonalViewModel {
  disabilities: DisabilityDetail[]
}

export interface PersonalCircumstancesViewModel extends PersonalViewModel {
  circumstances: PersonalCircumstanceDetail[]
}

export interface PersonalContactViewModel extends PersonalViewModel {
  personalContact: PersonalContactDetail
  ids: {
    crn: string
  }
}
