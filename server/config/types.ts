export interface ServerConfig {
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

export interface AgentConfig {
  maxSockets: number
  maxFreeSockets: number
  freeSocketTimeout: number
}

export interface TimeoutConfig {
  response: number
  deadline: number
}

export interface ApiConfig {
  enabled: boolean
  url: string
  timeout: TimeoutConfig
  agent: AgentConfig
}

export interface ClientCredentials {
  id: string
  secret: string
}

export interface AuthApiConfig extends ApiConfig {
  externalUrl: string
  apiClientCredentials: ClientCredentials
  systemClientCredentials: ClientCredentials
}

export interface DependentApisConfig {
  hmppsAuth: AuthApiConfig
  tokenVerification: ApiConfig
  community: ApiConfig
}
