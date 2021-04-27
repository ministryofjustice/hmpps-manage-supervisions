import * as faker from 'faker'
import { merge } from 'lodash'
import { ConfigService } from './config.service'
import { ApiConfig, ClientCredentials } from './types'

export function fakeApiConfig(partial: DeepPartial<ApiConfig> = {}): ApiConfig {
  return merge(
    {
      enabled: true,
      url: faker.internet.url(),
      timeout: {
        response: faker.datatype.number({ min: 5000, max: 30000 }),
        deadline: faker.datatype.number({ min: 5000, max: 30000 }),
      },
      agent: {
        maxSockets: faker.datatype.number({ min: 50, max: 150 }),
        maxFreeSockets: faker.datatype.number({ min: 5, max: 15 }),
        freeSocketTimeout: faker.datatype.number({ min: 5000, max: 60000 }),
      },
    },
    partial
  )
}

export function fakeClientCredentials(): ClientCredentials {
  return {
    id: faker.internet.userName(),
    secret: faker.internet.password(),
  }
}

export function fakeConfig(partial: DeepPartial<ConfigService> = {}): ConfigService {
  return merge(
    {
      server: {
        https: faker.datatype.boolean(),
        domain: faker.internet.domainName(),
        staticResourceCacheDuration: faker.datatype.number({ min: 60, max: 6000 }),
      },
      redis: {
        host: faker.internet.domainName(),
        password: faker.internet.password(),
        port: faker.internet.port(),
        tls: faker.datatype.boolean(),
      },
      session: {
        expiryMinutes: faker.datatype.number({ min: 60, max: 120 }),
        secret: faker.internet.password(),
      },
      apis: {
        hmppsAuth: {
          ...fakeApiConfig(),
          externalUrl: faker.internet.url(),
          apiClientCredentials: fakeClientCredentials(),
          systemClientCredentials: fakeClientCredentials(),
        },
        tokenVerification: fakeApiConfig(),
        community: fakeApiConfig(),
      },
    },
    partial
  )
}
