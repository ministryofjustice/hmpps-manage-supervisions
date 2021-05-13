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
  domain: string
  staticResourceCacheDuration: number
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
}

export interface Config {
  server: ServerConfig
  redis: RedisConfig
  session: SessionConfig
  apis: DependentApisConfig
}
