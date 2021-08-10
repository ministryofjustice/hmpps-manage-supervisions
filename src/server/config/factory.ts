import { pick } from 'lodash'
import {
  Config,
  ContactTypeCategory,
  DebugFlags,
  WellKnownAppointmentType,
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationType,
  WellKnownContactTypeConfig,
  WellKnownWarningLetterType,
  WellKnownContactTypeMeta,
} from './types'
import { ApplicationVersion } from '../util'
import { requirements } from './requirements'

interface EnvironmentFallback<T> {
  value: T
  developmentOnly: boolean
}

function fallback<T>(value: T): EnvironmentFallback<T> {
  return { value, developmentOnly: false }
}

function developmentOnly<T>(value: T): EnvironmentFallback<T> {
  return { value, developmentOnly: true }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function env<T>(name: string, parse: (value: string) => T, fallbackFn?: EnvironmentFallback<T>): T {
  if (process.env[name] !== undefined) {
    return parse(process.env[name])
  }

  if (fallbackFn !== undefined && (!isProduction() || !fallbackFn.developmentOnly)) {
    return fallbackFn.value
  }

  throw new Error(`Missing env var ${name}`)
}

function string(name: string, fallbackFn?: EnvironmentFallback<string>): string {
  return env(name, x => x, fallbackFn)
}

function int(name: string, fallbackFn?: EnvironmentFallback<number>): number {
  return env(name, x => parseInt(x, 10), fallbackFn)
}

function bool(name: string, fallbackFn?: EnvironmentFallback<boolean>): boolean {
  return env(name, x => x === 'true', fallbackFn)
}

export const CONTACT_DEFAULTS: WellKnownContactTypeConfig = {
  appointment: {
    [WellKnownAppointmentType.OfficeVisit]: { name: 'Office visit', codes: { nonRar: 'APAT' } },
    [WellKnownAppointmentType.HomeVisit]: { name: 'Home visit', codes: { nonRar: 'CHVS' } },
    [WellKnownAppointmentType.VideoCall]: { name: 'Video call', codes: { nonRar: 'COVC' } },
    [WellKnownAppointmentType.PhoneCall]: { name: 'Phone call', codes: { nonRar: 'COPT' } },
  },
  communication: {
    [WellKnownCommunicationType.EmailTextToOffender]: { name: 'Email/Text to Offender', code: 'CMOB' },
    [WellKnownCommunicationType.EmailTextFromOffender]: { name: 'Email/Text from Offender', code: 'CMOA' },
    [WellKnownCommunicationType.EmailTextToOther]: { name: 'Email/Text to Other', code: 'CM3B' },
    [WellKnownCommunicationType.EmailTextFromOther]: { name: 'Email/Text from Other', code: 'CM3A' },
    [WellKnownCommunicationType.PhoneCallToOffender]: { name: 'Phone call to Offender', code: 'CTOB' },
    [WellKnownCommunicationType.PhoneCallFromOffender]: { name: 'Phone call from Offender', code: 'CTOA' },
    [WellKnownCommunicationType.PhoneCallToOther]: { name: 'Phone call to Other', code: 'CT3B' },
    [WellKnownCommunicationType.PhoneCallFromOther]: { name: 'Phone call from Other', code: 'CT3A' },
  },
  warningLetter: {
    [WellKnownWarningLetterType.First]: 'AWLI',
    [WellKnownWarningLetterType.Second]: 'AWL2',
    [WellKnownWarningLetterType.Final]: 'AWLF',
    [WellKnownWarningLetterType.EnforcementLetterRequested]: 'AWLS',
    [WellKnownWarningLetterType.Withdrawn]: 'C040',
    [WellKnownWarningLetterType.BreachLetterSent]: 'CLBR',
    [WellKnownWarningLetterType.BreachConfirmationSent]: 'CBRC',
    [WellKnownWarningLetterType.GenericLetterToOffender]: 'CLOB',
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

const DEBUG_DEFAULTS: Record<DebugFlags, string> = {
  [DebugFlags.SetStaffCode]: 'CRSSTAFF1',
  [DebugFlags.SetTeamCode]: 'N07UAT',
  [DebugFlags.SetProviderCode]: 'N07',
}

export function configFactory(): Config {
  const authUrl = string('HMPPS_AUTH_URL', developmentOnly('http://localhost:9090/auth'))

  const appointment = Object.values(WellKnownAppointmentType)
    .map(type => {
      const defaults = CONTACT_DEFAULTS.appointment[type as WellKnownAppointmentType]
      const key = type.replace('-', '_').toUpperCase()
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
      const key = type.replace('-', '_').toUpperCase()
      return {
        [type]: {
          name: string(`${key}_NAME`, fallback(defaults.name)).trim(),
          code: string(`${key}_CODE`, fallback(defaults.code)).toUpperCase().trim(),
        } as WellKnownContactTypeMeta,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['communication']

  const warningLetter = Object.values(WellKnownWarningLetterType)
    .map(type => {
      const defaultCode = CONTACT_DEFAULTS['warningLetter'][type as WellKnownWarningLetterType]
      const key = type.replace('-', '_').toUpperCase()
      return {
        [type]: string(`${key}_CODE`, fallback(defaultCode)).toUpperCase().trim() as string,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['warningLetter']

  return {
    server: {
      name: ApplicationVersion.packageData.name,
      description: ApplicationVersion.packageData.description,
      version: ApplicationVersion.buildNumber,
      build: ApplicationVersion.buildInfo,
      port: int('PORT', fallback(3000)),
      isProduction: isProduction(),
      https: bool('PROTOCOL_HTTPS', fallback(isProduction())),
      domain: Object.freeze(new URL(string('INGRESS_URL', developmentOnly('http://localhost:3000')))),
      staticResourceCacheDuration: int('STATIC_RESOURCE_CACHE_DURATION', fallback(20)),
      debug: string('DEBUG', fallback(''))
        .split(',')
        .map(x => x.trim().toLowerCase())
        .reduce((agg, x) => {
          const [k, v] = x.split(':')
          agg[k] = v || DEBUG_DEFAULTS[k]
          return agg
        }, {}),
    },
    redis: {
      host: string('REDIS_HOST', developmentOnly('localhost')),
      port: int('REDIS_PORT', fallback(6379)),
      password: process.env.REDIS_AUTH_TOKEN,
      tls: bool('REDIS_TLS_ENABLED', fallback(false)),
    },
    session: {
      secret: string('SESSION_SECRET', developmentOnly('app-insecure-default-session')),
      expiryMinutes: int('WEB_SESSION_TIMEOUT_IN_MINUTES', fallback(120)),
    },
    delius: {
      baseUrl: Object.freeze(new URL(string('DELIUS_BASE_URL', developmentOnly('http://localhost:8082/delius')))),
    },
    apis: {
      hmppsAuth: {
        enabled: true,
        url: authUrl,
        externalUrl: string('HMPPS_AUTH_EXTERNAL_URL', fallback(authUrl)),
        timeout: int('HMPPS_AUTH_TIMEOUT', fallback(10000)),
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
        enabled: bool('TOKEN_VERIFICATION_ENABLED', fallback(false)),
        url: string('TOKEN_VERIFICATION_API_URL', developmentOnly('http://localhost:8100')),
        timeout: int('TOKEN_VERIFICATION_API_TIMEOUT', fallback(10000)),
      },
      community: {
        enabled: true,
        url: string('COMMUNITY_API_URL', developmentOnly('http://localhost:9091/community-api')),
        timeout: int('COMMUNITY_API_TIMEOUT', fallback(30000)),
      },
      assessRisksAndNeeds: {
        enabled: true,
        url: string('ASSESS_RISKS_AND_NEEDS_API_URL', developmentOnly('http://localhost:9091/assess-risks-and-needs')),
        timeout: int('ASSESS_RISKS_AND_NEEDS_API_TIMEOUT', fallback(30000)),
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
  }
}
