import {
  Config,
  DebugFlags,
  WellKnownAppointmentType,
  WellKnownContactTypeConfig,
  WellKnownAppointmentTypeMeta,
  WellKnownCommunicationType,
  WellKnownCommunicationTypeMeta,
} from './types'
import { ApplicationVersion } from '../util'

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
    [WellKnownCommunicationType.Email]: { name: 'Email', code: 'TODO_EMAIL' },
    [WellKnownCommunicationType.PhoneCall]: { name: 'Phone call', code: 'TODO_PHONE' },
    [WellKnownCommunicationType.TextMessage]: { name: 'Text message', code: 'TODO_TEXT' },
  },
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
        } as WellKnownCommunicationTypeMeta,
      }
    })
    .reduce((x, y) => ({ ...x, ...y })) as WellKnownContactTypeConfig['communication']

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
        url: string('COMMUNITY_API_URL', developmentOnly('http://localhost:8082')),
        timeout: int('COMMUNITY_API_TIMEOUT', fallback(30000)),
      },
    },
    contacts: {
      appointment,
      communication,
    },
  }
}
