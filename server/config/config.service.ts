import { Service } from 'typedi'
import * as dotenv from 'dotenv'
import { AgentConfig, DependentApisConfig, RedisConfig, ServerConfig, SessionConfig } from './types'

dotenv.config()

interface EnvironmentFallback<T> {
  value: T
  developmentOnly: boolean
}

function defaultAgentConfig(): AgentConfig {
  return {
    maxSockets: 100,
    maxFreeSockets: 10,
    freeSocketTimeout: 30000,
  }
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

@Service()
export class ConfigService {
  get server(): ServerConfig {
    return {
      isProduction: isProduction(),
      https: bool('PROTOCOL_HTTPS', fallback(isProduction())),
      domain: string('INGRESS_URL', developmentOnly('http://localhost:3000')),
      staticResourceCacheDuration: int('STATIC_RESOURCE_CACHE_DURATION', fallback(20)),
    }
  }

  get redis(): RedisConfig {
    return {
      host: string('REDIS_HOST', developmentOnly('localhost')),
      port: int('REDIS_PORT', fallback(6379)),
      password: process.env.REDIS_AUTH_TOKEN,
      tls: bool('REDIS_TLS_ENABLED', fallback(false)),
    }
  }

  get session(): SessionConfig {
    return {
      secret: string('SESSION_SECRET', developmentOnly('app-insecure-default-session')),
      expiryMinutes: int('WEB_SESSION_TIMEOUT_IN_MINUTES', fallback(120)),
    }
  }

  get apis(): DependentApisConfig {
    const authUrl = string('HMPPS_AUTH_URL', developmentOnly('http://localhost:9090/auth'))
    return {
      hmppsAuth: {
        enabled: true,
        url: authUrl,
        externalUrl: string('HMPPS_AUTH_EXTERNAL_URL', fallback(authUrl)),
        timeout: {
          response: int('HMPPS_AUTH_TIMEOUT_RESPONSE', fallback(10000)),
          deadline: int('HMPPS_AUTH_TIMEOUT_DEADLINE', fallback(10000)),
        },
        agent: defaultAgentConfig(),
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
        timeout: {
          response: int('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', fallback(10000)),
          deadline: int('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', fallback(10000)),
        },
        agent: defaultAgentConfig(),
      },
      community: {
        enabled: true,
        url: string('COMMUNITY_API_URL', developmentOnly('http://localhost:8082')),
        timeout: {
          response: int('COMMUNITY_API_TIMEOUT_RESPONSE', fallback(30000)),
          deadline: int('COMMUNITY_API_TIMEOUT_DEADLINE', fallback(30000)),
        },
        agent: defaultAgentConfig(),
      },
    }
  }
}
