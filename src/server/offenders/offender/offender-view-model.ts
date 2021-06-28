import { ContactDetails } from '../../community-api'
import { ActivityLogEntry } from './activity'
import { DateTime } from 'luxon'
import { ConvictionDetails } from './sentence'
import { RecentAppointments } from './schedule'

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
}

export interface OffenderViewModelBase {
  page: OffenderPage
  ids: {
    crn: string
  }
  displayName: string
  links: OffenderLinks
}

export interface OffenderOverviewViewModel extends OffenderViewModelBase {
  page: OffenderPage.Overview
  contactDetails?: ContactDetails
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
  address?: string[]
  phoneNumbers: string[]
  emailAddresses: string[]
  lastUpdated?: DateTime
}

export interface PersonalDetailsViewModel {
  name: string
  aliases: string[]
  dateOfBirth?: DateTime
  preferredLanguage?: string
  disabilities: string[]
}

export interface OffenderPersonalViewModel extends OffenderViewModelBase {
  page: OffenderPage.Personal
  contactDetails: ContactDetailsViewModel
  personalDetails: PersonalDetailsViewModel
}

export interface OffenderSentenceViewModel extends OffenderViewModelBase, ConvictionDetails {
  page: OffenderPage.Sentence
}

export type OffenderViewModel =
  | OffenderOverviewViewModel
  | OffenderScheduleViewModel
  | OffenderActivityViewModel
  | OffenderPersonalViewModel
  | OffenderSentenceViewModel
