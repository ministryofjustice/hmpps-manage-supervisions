import { ActivityLogEntry } from './activity'
import { DateTime } from 'luxon'
import { ConvictionDetails } from './sentence'
import { AppointmentSummary, RecentAppointments } from './schedule'
import { RegistrationFlag, Risks } from './risk/risk.types'

export enum OffenderPage {
  Overview = 'overview',
  Schedule = 'schedule',
  Activity = 'activity',
  Personal = 'personal',
  Sentence = 'sentence',
}

export type OffenderPageLinks = { [Page in OffenderPage]: string }

export interface OffenderLinks extends OffenderPageLinks {
  arrangeAppointment: string
  addActivity: string
  addressBook: string
  circumstances: string
  disabilities: string
}

export interface OffenderViewModelBase {
  page: OffenderPage
  ids: {
    crn: string
    pnc?: string
  }
  displayName: string
  links: OffenderLinks
  registrations?: RegistrationFlag[]
}

export interface OffenderOverviewViewModel extends OffenderViewModelBase {
  page: OffenderPage.Overview
  conviction?: ConvictionDetails
  contactDetails: ContactDetailsViewModel
  personalDetails: PersonalDetailsViewModel
  appointmentSummary: AppointmentSummary
  risks: Risks
}

export interface OffenderScheduleViewModel extends OffenderViewModelBase {
  page: OffenderPage.Schedule
  appointments: RecentAppointments
}

export interface OffenderActivityViewModel extends OffenderViewModelBase {
  page: OffenderPage.Activity
  contacts: ActivityLogEntry[]
  pagination: {
    page?: number
    size?: number
  }
}

export interface ContactDetailsViewModel {
  address?: {
    lines: string[]
    type?: string
    phone?: string
    startDate: DateTime
  }
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

export interface OffenderPersonalViewModel extends OffenderViewModelBase {
  page: OffenderPage.Personal
  contactDetails: ContactDetailsViewModel
  personalDetails: PersonalDetailsViewModel
}

export interface OffenderSentenceViewModel extends OffenderViewModelBase {
  page: OffenderPage.Sentence
  conviction?: ConvictionDetails
}

export type OffenderViewModel =
  | OffenderOverviewViewModel
  | OffenderScheduleViewModel
  | OffenderActivityViewModel
  | OffenderPersonalViewModel
  | OffenderSentenceViewModel
