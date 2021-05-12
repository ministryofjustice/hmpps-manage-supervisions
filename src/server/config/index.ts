import { Config } from './types'
import { ApplicationVersion } from '../util'
export * from './types'

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

export function configFactory(): Config {
  const authUrl = string('HMPPS_AUTH_URL', developmentOnly('http://localhost:9090/auth'))
  return {
    server: {
      name: ApplicationVersion.packageData.name,
      description: ApplicationVersion.packageData.description,
      version: ApplicationVersion.buildNumber,
      build: ApplicationVersion.buildInfo,
      port: int('PORT', fallback(3000)),
      isProduction: isProduction(),
      https: bool('PROTOCOL_HTTPS', fallback(isProduction())),
      domain: string('INGRESS_URL', developmentOnly('http://localhost:3000')),
      staticResourceCacheDuration: int('STATIC_RESOURCE_CACHE_DURATION', fallback(20)),
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
  }
}
