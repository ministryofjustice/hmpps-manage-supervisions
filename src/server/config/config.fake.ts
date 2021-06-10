import { ConfigModule } from '@nestjs/config'
import { DynamicModule, Module } from '@nestjs/common'
import * as faker from 'faker'
import { merge } from 'lodash'
import { ApiConfig, ClientCredentials, Config } from './types'
import { CONTACT_DEFAULTS } from './factory'

export function fakeApiConfig(partial: DeepPartial<ApiConfig> = {}): ApiConfig {
  return merge(
    {
      enabled: true,
      url: faker.internet.url(),
      timeout: faker.datatype.number({ min: 5000, max: 30000 }),
      agent: {
        maxSockets: faker.datatype.number({ min: 50, max: 150 }),
        maxFreeSockets: faker.datatype.number({ min: 5, max: 15 }),
        freeSocketTimeout: faker.datatype.number({ min: 5000, max: 60000 }),
      },
    },
    partial,
  )
}

export function fakeClientCredentials(): ClientCredentials {
  return {
    id: faker.internet.userName(),
    secret: faker.internet.password(),
  }
}

export function fakeConfig(partial: DeepPartial<Config> = {}): Config {
  return merge(
    {
      server: {
        name: faker.helpers.slugify(faker.company.bs()),
        description: faker.company.bs(),
        version: faker.system.semver(),
        build: {
          buildNumber: faker.system.semver(),
          gitRef: faker.git.commitSha(),
        },
        port: faker.datatype.number({ min: 3000, max: 5000 }),
        isProduction: false,
        https: faker.datatype.boolean(),
        domain: new URL(faker.internet.url()),
        staticResourceCacheDuration: faker.datatype.number({ min: 60, max: 6000 }),
        debug: {},
        refreshEnabled: faker.datatype.boolean(),
      },
      redis: {
        host: faker.internet.domainName(),
        password: faker.internet.password(),
        port: faker.internet.port(),
        tls: faker.datatype.boolean(),
      },
      session: {
        secret: faker.internet.password(),
      },
      apis: {
        hmppsAuth: {
          ...fakeApiConfig(),
          externalUrl: faker.internet.url(),
          apiClientCredentials: fakeClientCredentials(),
          systemClientCredentials: fakeClientCredentials(),
          issuerPath: '/issuer',
        },
        tokenVerification: fakeApiConfig(),
        community: fakeApiConfig(),
      },
      contacts: CONTACT_DEFAULTS,
    },
    partial,
  )
}

@Module({})
export class FakeConfigModule {
  static register(partial: DeepPartial<Config> = {}): DynamicModule {
    const config = fakeConfig(partial)
    return {
      module: FakeConfigModule,
      imports: [
        ConfigModule.forRoot({ load: [() => config], ignoreEnvVars: true, ignoreEnvFile: true, isGlobal: true }),
      ],
    }
  }
}
