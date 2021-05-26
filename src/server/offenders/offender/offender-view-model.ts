import { AppointmentDetail, ContactDetails } from '../../community-api'

export enum OffenderPage {
  Overview = 'overview',
  Schedule = 'schedule',
  Activity = 'activity',
  Personal = 'personal',
  Sentence = 'sentence',
}

export type OffenderLinks = { [Page in OffenderPage]: string } & { arrangeAppointment: string }

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

export interface AppointmentListViewModel extends AppointmentDetail {
  name: string
  href: string
}

export interface RecentAppointments {
  future: AppointmentListViewModel[]
  recent: AppointmentListViewModel[]
  past: AppointmentListViewModel[]
}

export interface OffenderScheduleViewModel extends OffenderViewModelBase {
  page: OffenderPage.Schedule
  appointments: RecentAppointments
}

export interface OffenderActivityViewModel extends OffenderViewModelBase {
  page: OffenderPage.Activity
}

export interface OffenderPersonalViewModel extends OffenderViewModelBase {
  page: OffenderPage.Personal
}

export interface OffenderSentenceViewModel extends OffenderViewModelBase {
  page: OffenderPage.Sentence
}

export type OffenderViewModel =
  | OffenderOverviewViewModel
  | OffenderScheduleViewModel
  | OffenderActivityViewModel
  | OffenderPersonalViewModel
  | OffenderSentenceViewModel
