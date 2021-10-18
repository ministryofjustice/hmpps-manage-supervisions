import { URL } from 'url'

export enum FeatureFlags {}

/**
 * These align to a subset of npm log levels that are supported by winston.
 * https://github.com/winstonjs/winston#logging-levels
 */
export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Verbose = 'verbose',
}

export interface ServerConfig {
  name: string
  description: string
  version: string
  /**
   * True if node is running in 'production' mode.
   * NOTE: This does not mean the app is deployed to the production environment.
   */
  isProduction: boolean
  /**
   * The name of the environment where the app is deployed.
   */
  deploymentEnvironment: string
  port: number
  domain: URL
  staticResourceCacheDuration: number
  features: Partial<Record<FeatureFlags, boolean>>
  logLevel: LogLevel
  sentryDsn?: string
  supportEmail: string
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
  url: URL
  timeout: number
  specVersion?: string
}

export interface ClientCredentials {
  id: string
  secret: string
}

export interface AuthApiConfig extends ApiConfig {
  externalUrl: URL
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

export interface OASysConfig {
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
  codes?: {
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
  CpsPackageRequested = 'cps-package-requested',
  InformationFromThirdParty = 'information-from-third-party',
  InformationToThirdParty = 'information-to-third-party',
  InformationFromOffender = 'information-from-offender',
  InformationFromExternalAgency = 'information-from-external-agency',
  InformationToExternalAgency = 'information-to-external-agency',
  InformationToOffender = 'information-to-offender',
  InformationOther = 'information-from-other',
  InformationDocumentsRequested = 'information-documents-requested',
  InternalCommunications = 'internal-communications',
  LetterFaxFromOffender = 'letter-fax-from offender',
  LetterFaxToOther = 'letter-fax-to-other',
  LetterFaxFromOther = 'letter-fax-from-other',
  LetterFaxToOffender = 'letter-fax-from-offender',
}

export interface WellKnownContactTypeMeta {
  name: string
  code: string
  from?: string
  to?: string
  description?: string
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
  EnforcementLetterRequested = 'enforcement-letter-requested',
}

export enum ContactTypeCategory {
  Appointment = 'appointment',
  Communication = 'communication',
  WarningLetter = 'warningLetter',
  Other = 'other',
  BreachStart = 'breach-start',
  BreachEnd = 'breach-end',
  System = 'system',
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
}

export interface RiskConfig {
  ignoredRegistrationTypes: string[]
}

export interface Config {
  server: ServerConfig
  redis: RedisConfig
  session: SessionConfig
  apis: DependentApisConfig
  contacts: WellKnownContactTypeConfig
  requirements: WellKnownRequirementTypeConfig
  delius: DeliusConfig
  oasys: OASysConfig
  risk: RiskConfig
}
