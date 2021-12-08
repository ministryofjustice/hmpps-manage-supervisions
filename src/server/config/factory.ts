import { pick } from 'lodash'
import {
  Config,
  ContactTypeCategory,
  FeatureFlags,
  LogLevel,
  WellKnownAppointmentType,
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationType,
  WellKnownContactTypeConfig,
  WellKnownContactTypeMeta,
  WellKnownWarningLetterType,
} from './types'
import { getApplicationInfo } from '../util'
import { requirements } from './requirements'
import { URL } from 'url'

enum DefaultFallbackType {
  Always,
  NonProductionNodeEnvironment,
  DeploymentEnvironment,
}

interface FallbackBase<Default extends DefaultFallbackType, T> {
  type: Default
  value: T
}

type AlwaysFallback<T> = FallbackBase<DefaultFallbackType.Always, T>

type NonProductionNodeEnvironment<T> = FallbackBase<DefaultFallbackType.NonProductionNodeEnvironment, T>

interface DeploymentEnvironmentFallback<T> extends FallbackBase<DefaultFallbackType.DeploymentEnvironment, T> {
  environment: string
}

type Fallback<T> = AlwaysFallback<T> | NonProductionNodeEnvironment<T> | DeploymentEnvironmentFallback<T>

function fallback<T>(value: T): Fallback<T> {
  return { type: DefaultFallbackType.Always, value }
}

function developmentOnly<T>(value: T): Fallback<T> {
  return { type: DefaultFallbackType.NonProductionNodeEnvironment, value }
}

function localOnly<T>(value: T): Fallback<T> {
  return { type: DefaultFallbackType.DeploymentEnvironment, environment: 'local', value }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function deploymentEnvironment() {
  const value = process.env.DEPLOYMENT_ENV
  if (!value) {
    if (isProduction()) {
      throw new Error('DEPLOYMENT_ENV is required')
    }
    return 'local'
  }
  return value
}

function env<T>(name: string, parse: (value: string) => T, ...fallbacks: Fallback<T>[]): T {
  if (process.env[name] !== undefined) {
    const value = parse(process.env[name])
    if (value !== undefined) {
      return value
    }
  }

  const environment = deploymentEnvironment()
  const production = isProduction()
  for (const fallback of fallbacks) {
    switch (fallback.type) {
      case DefaultFallbackType.Always:
        return fallback.value
      case DefaultFallbackType.DeploymentEnvironment:
        if (environment === fallback.environment) {
          return fallback.value
        }
        break
      case DefaultFallbackType.NonProductionNodeEnvironment:
        if (!production) {
          return fallback.value
        }
        break
    }
  }

  throw new Error(`Missing env var ${name}`)
}

function string(name: string, ...fallbacks: Fallback<string>[]): string {
  return env(name, x => x, ...fallbacks)
}

function url(name: string, ...fallbacks: Fallback<string>[]): URL {
  const value = string(name, ...fallbacks)
  return value ? Object.freeze(new URL(value)) : null
}

function int(name: string, ...fallbacks: Fallback<number>[]): number {
  return env(name, x => parseInt(x, 10), ...fallbacks)
}

function bool(name: string, ...fallbacks: Fallback<boolean>[]): boolean {
  return env(name, x => x === 'true', ...fallbacks)
}

function stringEnum<T>(cls: T, name: string, ...fallbacks: Fallback<T[keyof T]>[]): T[keyof T] {
  const values = Object.values(cls)
  return env(
    name,
    x => values.find(v => v.localeCompare(x.trim(), undefined, { sensitivity: 'base' }) === 0),
    ...fallbacks,
  )
}

export const CONTACT_DEFAULTS: WellKnownContactTypeConfig = {
  appointment: {
    [WellKnownAppointmentType.OfficeVisit]: { name: 'Office visit', codes: { nonRar: 'COAP' } },
    [WellKnownAppointmentType.HomeVisit]: { name: 'Home visit', codes: { nonRar: 'CHVS' } },
    [WellKnownAppointmentType.VideoCall]: { name: 'Video call', codes: { nonRar: 'COVC' } },
    [WellKnownAppointmentType.PhoneCall]: { name: 'Phone call', codes: { nonRar: 'COPT' } },
  },
  communication: {
    [WellKnownCommunicationType.EmailTextToOffender]: {
      name: 'Email/Text to Offender',
      code: 'CMOB',
      to: '{}',
      description: 'Email or text message to {}',
    },
    [WellKnownCommunicationType.EmailTextFromOffender]: {
      name: 'Email/Text from Offender',
      code: 'CMOA',
      from: '{}',
      description: 'Email or text message from {}',
    },
    [WellKnownCommunicationType.EmailTextToOther]: {
      name: 'Email/Text to Other',
      code: 'CM3B',
      description: 'Email or text message to a third party',
    },
    [WellKnownCommunicationType.EmailTextFromOther]: {
      name: 'Email/Text from Other',
      code: 'CM3A',
      description: 'Email or text message from a third party',
    },
    [WellKnownCommunicationType.PhoneCallToOffender]: {
      name: 'Phone call to Offender',
      code: 'CTOB',
      to: '{}',
      description: 'Phone call to {}',
    },
    [WellKnownCommunicationType.PhoneCallFromOffender]: {
      name: 'Phone call from Offender',
      code: 'CTOA',
      from: '{}',
      description: 'Phone call from {}',
    },
    [WellKnownCommunicationType.PhoneCallToOther]: {
      name: 'Phone call to Other',
      code: 'CT3B',
      description: 'Phone call to a third party',
    },
    [WellKnownCommunicationType.PhoneCallFromOther]: {
      name: 'Phone call from Other',
      code: 'CT3A',
      description: 'Phone call from a third party',
    },
    [WellKnownCommunicationType.CpsPackageRequested]: {
      name: 'CPS Package Request',
      code: 'CMRQ',
      description: 'CPS pack requested',
    },
    [WellKnownCommunicationType.InformationFromThirdParty]: {
      name: 'Information - from 3rd Party',
      code: 'CI3A',
      description: 'Information from a third party',
    },
    [WellKnownCommunicationType.InformationFromOffender]: {
      name: 'Information - from Offender',
      code: 'CIOA',
      from: '{}',
      description: 'Information from {}',
    },
    [WellKnownCommunicationType.InformationFromExternalAgency]: {
      name: 'Information - from External Agency',
      code: 'CIEA',
      description: 'Information from a third party',
    },
    [WellKnownCommunicationType.InformationOther]: {
      name: 'Information - Other',
      code: 'CIZZ',
      description: 'Information from a third party',
    },
    [WellKnownCommunicationType.InformationToThirdParty]: {
      name: 'Information - to 3rd Party',
      code: 'CI3B',
      description: 'Information sent to a third party',
    },
    [WellKnownCommunicationType.InformationToExternalAgency]: {
      name: 'Information - to External Agency',
      code: 'CIEB',
      description: 'Information sent to a third party',
    },
    [WellKnownCommunicationType.InformationToOffender]: {
      name: 'Information - to Offender',
      code: 'CIOB',
      to: '{}',
      description: 'Information sent to {}',
    },
    [WellKnownCommunicationType.InformationDocumentsRequested]: {
      name: 'Information / Documents Requested',
      code: 'C325',
      from: '{}',
      description: 'Information requested from {}',
    },
    [WellKnownCommunicationType.InternalCommunications]: {
      name: 'Internal Communications',
      code: 'C326',
      description: 'Communication with staff',
    },
    [WellKnownCommunicationType.LetterFaxFromOffender]: {
      name: 'Letter/Fax from Offender',
      code: 'CLOA',
      from: '{}',
      description: 'Letter from {}',
    },
    [WellKnownCommunicationType.LetterFaxToOffender]: {
      name: 'Letter/Fax to Offender',
      code: 'CLOB',
      to: '{}',
      description: 'Letter to {}',
    },
    [WellKnownCommunicationType.LetterFaxFromOther]: {
      name: 'Letter/Fax from Other',
      code: 'CL3A',
      description: 'Letter from a third party',
    },
    [WellKnownCommunicationType.LetterFaxToOther]: {
      name: 'Letter/Fax to Other',
      code: 'CL3B',
      description: 'Letter to a third party',
    },
  },
  warningLetter: {
    [WellKnownWarningLetterType.First]: 'AWLI',
    [WellKnownWarningLetterType.Second]: 'AWL2',
    [WellKnownWarningLetterType.Final]: 'AWLF',
    [WellKnownWarningLetterType.EnforcementLetterRequested]: 'AWLS',
    [WellKnownWarningLetterType.Withdrawn]: 'C040',
    [WellKnownWarningLetterType.BreachLetterSent]: 'CLBR',
    [WellKnownWarningLetterType.BreachConfirmationSent]: 'CBRC',
  },
  [ContactTypeCategory.BreachStart]: [{ code: 'AIBR', name: 'Breach started' }],
  [ContactTypeCategory.BreachEnd]: [
    { code: 'ABCC', name: 'Breach proven, committed to custody', proven: true },
    { code: 'ABCF', name: 'Breach proven, fine issued', proven: true },
    { code: 'ABNA', name: 'Breach proven, no action', proven: true },
    { code: 'ABNP', name: 'Breach not proven', proven: false },
    { code: 'ABPC', name: 'Breach proven, concluded', proven: true },
    { code: 'ABPP', name: 'Breach proven, re-sentenced', proven: true },
    { code: 'ABSD', name: 'Breach proven, SDO imposed', proven: true },
    { code: 'ABWD', name: 'Breach withdrawn', proven: false },
    { code: 'CPSS', name: 'Start of post sentence supervision', proven: true },
    { code: 'ERCL', name: 'Recalled to prison', proven: true },
  ],
}

const FEATURE_DEFAULTS: Record<FeatureFlags, boolean> = {
  [FeatureFlags.RecordOutcome]: true,
}

export function configFactory(): Config {
  const authUrl = url('HMPPS_AUTH_URL', developmentOnly('http://localhost:9090/auth'))

  const appointment = Object.values(WellKnownAppointmentType)
    .map(type => {
      const defaults = CONTACT_DEFAULTS.appointment[type as WellKnownAppointmentType]
      const key = toEnvVar(type)
      return {
        [type]: {
          name: string(`${key}_NAME`, fallback(defaults.name)).trim(),
          codes: { nonRar: string(`${key}_CODE_NON_RAR`, fallback(defaults.codes.nonRar)).toUpperCase().trim() },
        } as WellKnownAppointmentTypeMeta,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['appointment']

  const communication = Object.values(WellKnownCommunicationType)
    .map(type => {
      const defaults = CONTACT_DEFAULTS.communication[type as WellKnownCommunicationType]
      const key = toEnvVar(type)
      return {
        [type]: {
          name: string(`${key}_NAME`, fallback(defaults.name)).trim(),
          code: string(`${key}_CODE`, fallback(defaults.code)).toUpperCase().trim(),
          from: string(`${key}_FROM`, fallback(defaults.from))?.trim(),
          to: string(`${key}_CODE`, fallback(defaults.to))?.trim(),
          description: string(`${key}_DESCRIPTION`, fallback(defaults.description))?.trim(),
        } as WellKnownContactTypeMeta,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['communication']

  const warningLetter = Object.values(WellKnownWarningLetterType)
    .map(type => {
      const defaultCode = CONTACT_DEFAULTS['warningLetter'][type as WellKnownWarningLetterType]
      const key = toEnvVar(type)
      return {
        [type]: string(`${key}_CODE`, fallback(defaultCode)).toUpperCase().trim() as string,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['warningLetter']

  const features = Object.values(FeatureFlags)
    .map(feature => {
      const defaultCode = FEATURE_DEFAULTS[feature as unknown as FeatureFlags]
      const key = toEnvVar(feature)
      return {
        [feature]: bool(key, fallback(defaultCode)),
      }
    })
    .reduce((x, y) => ({ ...x, ...y }), {}) as Record<FeatureFlags, boolean>

  const tokenVerificationEnabled = bool('TOKEN_VERIFICATION_ENABLED', fallback(false))

  const appInfo = getApplicationInfo()
  if (isProduction() && !appInfo.version) {
    throw new Error('No build info file present')
  }

  return {
    server: {
      name: appInfo.name,
      description: appInfo.description,
      version: appInfo.version || 'unknown',
      port: int('PORT', fallback(3000)),
      deploymentEnvironment: deploymentEnvironment(),
      isProduction: isProduction(),
      domain: url('INGRESS_URL', developmentOnly('http://localhost:3000')),
      staticResourceCacheDuration: int('STATIC_RESOURCE_CACHE_DURATION', fallback(20)),
      features,
      logLevel: stringEnum(LogLevel, 'LOG_LEVEL', fallback(LogLevel.Info)),
      sentryDsn: string('SENTRY_DSN', developmentOnly(null), localOnly(null)),
      supportEmail: string('SUPPORT_EMAIL', fallback('manage-supervisions-support@digital.justice.gov.uk')),
    },
    redis: {
      host: string('REDIS_HOST', developmentOnly('localhost')),
      port: int('REDIS_PORT', fallback(6379)),
      password: process.env.REDIS_AUTH_TOKEN,
      tls: bool('REDIS_TLS_ENABLED', fallback(false)),
    },
    session: {
      secret: string('SESSION_SECRET', developmentOnly('app-insecure-default-session')),
      expiryMinutes: int('WEB_SESSION_TIMEOUT_IN_MINUTES', fallback(60 * 12 - 5)),
    },
    delius: {
      baseUrl: url('DELIUS_BASE_URL', developmentOnly('http://localhost:9091/delius')),
    },
    oasys: {
      baseUrl: url('OASYS_BASE_URL', developmentOnly('http://localhost:9091/oasys')),
    },
    apis: {
      hmppsAuth: {
        enabled: true,
        criticalAvailability: true,
        url: authUrl,
        externalUrl: url('HMPPS_AUTH_EXTERNAL_URL', fallback(authUrl.href)),
        timeout: int('HMPPS_AUTH_TIMEOUT', fallback(5000)),
        apiClientCredentials: {
          id: string('API_CLIENT_ID', developmentOnly('interventions')),
          secret: string('API_CLIENT_SECRET', developmentOnly('clientsecret')),
        },
        systemClientCredentials: {
          id: string('SYSTEM_CLIENT_ID', developmentOnly('interventions')),
          secret: string('SYSTEM_CLIENT_SECRET', developmentOnly('clientsecret')),
        },
        issuerPath: string('HMPPS_AUTH_ISSUER_PATH', fallback('/issuer')),
      },
      tokenVerification: {
        enabled: tokenVerificationEnabled,
        criticalAvailability: true,
        url: url(
          'TOKEN_VERIFICATION_API_URL',
          tokenVerificationEnabled ? developmentOnly('http://localhost:8100') : fallback(null),
        ),
        timeout: int('TOKEN_VERIFICATION_API_TIMEOUT', fallback(10000)),
      },
      community: {
        enabled: true,
        criticalAvailability: true,
        url: url('COMMUNITY_API_URL', developmentOnly('http://localhost:9091/community-api')),
        timeout: int('COMMUNITY_API_TIMEOUT', fallback(10000)),
        specVersion: (appInfo.apiSpecVersions && appInfo.apiSpecVersions['community-api']) || null,
      },
      assessRisksAndNeeds: {
        enabled: true,
        criticalAvailability: false,
        url: url('ASSESS_RISKS_AND_NEEDS_API_URL', developmentOnly('http://localhost:9091/assess-risks-and-needs')),
        timeout: int('ASSESS_RISKS_AND_NEEDS_API_TIMEOUT', fallback(10000)),
        specVersion: (appInfo.apiSpecVersions && appInfo.apiSpecVersions['assess-risks-and-needs-api']) || null,
      },
      delius: {
        enabled: false,
        criticalAvailability: false,
        url: url('DELIUS_API_URL', developmentOnly('http://localhost:9091/delius')),
        timeout: int('DELIUS_API_TIMEOUT', fallback(10000)),
        specVersion: (appInfo.apiSpecVersions && appInfo.apiSpecVersions['delius-api']) || null,
      },
    },
    contacts: {
      appointment,
      communication,
      warningLetter,
      // TODO allow overriding?
      ...pick(CONTACT_DEFAULTS, [ContactTypeCategory.BreachStart, ContactTypeCategory.BreachEnd]),
    },
    requirements,
    risk: {
      // default is Low RoSH, Medium RoSH, High RoSH & Very High RoSH
      ignoredRegistrationTypes: string('RISK_IGNORED_REGISTRATION_TYPES', fallback('RLRH,RMRH,RHRH,RVHR'))
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x),
    },
  }

  function toEnvVar(type: string) {
    return type.replace(/-/g, '_').toUpperCase()
  }
}
