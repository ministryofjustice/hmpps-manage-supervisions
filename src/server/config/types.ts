import { URL } from 'url'

export enum DebugFlags {
  /**
   * The staff code will be set for non-delius users.
   */
  SetStaffCode = 'set-staff',

  /**
   * The team code will be set for non-delius users.
   */
  SetTeamCode = 'set-team',

  /**
   * The provider code will be set for non-delius users.
   */
  SetProviderCode = 'set-provider',
}

export interface ServerConfig {
  name: string
  description: string
  version: string
  build: {
    buildNumber: string
    gitRef: string
  }
  isProduction: boolean
  port: number
  https: boolean
  domain: URL
  staticResourceCacheDuration: number
  debug: Partial<Record<DebugFlags, string>>
}

export interface RedisConfig {
  port: number
  host: string
  password: string
  tls: boolean
}

export interface SessionConfig {
  secret: string
  expiryMinutes: number
}

export interface ApiConfig {
  enabled: boolean
  url: string
  timeout: number
}

export interface ClientCredentials {
  id: string
  secret: string
}

export interface AuthApiConfig extends ApiConfig {
  externalUrl: string
  apiClientCredentials: ClientCredentials
  systemClientCredentials: ClientCredentials
  issuerPath: string
}

export interface DependentApisConfig {
  hmppsAuth: AuthApiConfig
  tokenVerification: ApiConfig
  community: ApiConfig
  assessRisksAndNeeds: ApiConfig
}

export interface DeliusConfig {
  baseUrl: URL
}

export enum WellKnownAppointmentType {
  OfficeVisit = 'office-visit',
  HomeVisit = 'home-visit',
  VideoCall = 'video-call',
  PhoneCall = 'phone-call',
}

export interface WellKnownAppointmentTypeMeta {
  name: string
  codes: {
    nonRar: string
  }
}

export enum WellKnownCommunicationType {
  EmailTextToOffender = 'email-text-to-offender',
  EmailTextFromOffender = 'email-text-from-offender',
  EmailTextToOther = 'email-text-to-other',
  EmailTextFromOther = 'email-text-from-other',
  PhoneCallToOffender = 'phone-call-to-offender',
  PhoneCallFromOffender = 'phone-call-from-offender',
  PhoneCallToOther = 'phone-call-to-other',
  PhoneCallFromOther = 'phone-call-from-other',
}

export interface WellKnownContactTypeMeta {
  name: string
  code: string
}

export interface WellKnownBreachEndContactTypeMeta extends WellKnownContactTypeMeta {
  proven: boolean
}

export enum WellKnownWarningLetterType {
  First = 'first',
  Second = 'second',
  Final = 'final',
  Withdrawn = 'withdrawn',
  BreachLetterSent = 'breach-letter-sent',
  BreachConfirmationSent = 'breach-confirmation-sent',
  GenericLetterToOffender = 'generic-letter-to-offender',
  EnforcementLetterRequested = 'enforcement-letter-requested',
}

export enum ContactTypeCategory {
  Appointment = 'appointment',
  Communication = 'communication',
  WarningLetter = 'warningLetter',
  Other = 'other',
  BreachStart = 'breach-start',
  BreachEnd = 'breach-end',
}

export interface WellKnownContactTypeConfig {
  [ContactTypeCategory.Appointment]: { [Type in WellKnownAppointmentType]: WellKnownAppointmentTypeMeta }
  [ContactTypeCategory.Communication]: { [Type in WellKnownCommunicationType]: WellKnownContactTypeMeta }
  [ContactTypeCategory.WarningLetter]: { [Type in WellKnownWarningLetterType]: string }
  [ContactTypeCategory.BreachStart]: WellKnownContactTypeMeta[]
  [ContactTypeCategory.BreachEnd]: WellKnownBreachEndContactTypeMeta[]
}

export type WellKnownRequirementTypeConfig = {
  [Code in string]: { pattern: string; subTypePatterns?: { [Code in string]: string }; isRar?: boolean }
}

export enum WellKnownRequirementTypePattern {
  SubCategory = '{sub-category}',
  Length = '{length}',
  Unit = '{unit}',
  LengthAndUnit = '{length} {unit}',
  Progress = '{progress}',
}

export interface Config {
  server: ServerConfig
  redis: RedisConfig
  session: SessionConfig
  apis: DependentApisConfig
  contacts: WellKnownContactTypeConfig
  requirements: WellKnownRequirementTypeConfig
  delius: DeliusConfig
}
