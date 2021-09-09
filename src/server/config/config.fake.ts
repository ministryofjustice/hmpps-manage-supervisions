import { ConfigModule } from '@nestjs/config'
import { DynamicModule, Module } from '@nestjs/common'
import * as faker from 'faker'
import { ApiConfig, ClientCredentials, Config, FeatureFlags, LogLevel } from './types'
import { CONTACT_DEFAULTS } from './factory'
import { requirements } from './requirements'
import { fake } from '../util/util.fake'

export const fakeApiConfig = fake<ApiConfig>(() => ({
  enabled: true,
  url: new URL(faker.internet.url()),
  timeout: faker.datatype.number({ min: 5000, max: 30000 }),
  agent: {
    maxSockets: faker.datatype.number({ min: 50, max: 150 }),
    maxFreeSockets: faker.datatype.number({ min: 5, max: 15 }),
    freeSocketTimeout: faker.datatype.number({ min: 5000, max: 60000 }),
  },
}))

function fakeClientCredentials(): ClientCredentials {
  return {
    id: faker.internet.userName(),
    secret: faker.internet.password(),
  }
}

export const fakeConfig = fake<Config>(() => ({
  server: {
    name: faker.helpers.slugify(faker.company.bs()),
    description: faker.company.bs(),
    version: faker.system.semver(),
    port: faker.datatype.number({ min: 3000, max: 5000 }),
    isProduction: false,
    deploymentEnvironment: 'local',
    domain: new URL(faker.internet.url()),
    staticResourceCacheDuration: faker.datatype.number({ min: 60, max: 6000 }),
    features: {
      [FeatureFlags.EnableAppointmentBooking]: true,
    },
    logLevel: LogLevel.Info,
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
  delius: {
    baseUrl: new URL(faker.internet.url()),
  },
  oasys: {
    baseUrl: new URL(faker.internet.url()),
  },
  apis: {
    hmppsAuth: {
      ...fakeApiConfig(),
      externalUrl: new URL(faker.internet.url()),
      apiClientCredentials: fakeClientCredentials(),
      systemClientCredentials: fakeClientCredentials(),
      issuerPath: '/issuer',
    },
    tokenVerification: fakeApiConfig(),
    community: fakeApiConfig(),
    assessRisksAndNeeds: fakeApiConfig(),
  },
  contacts: CONTACT_DEFAULTS,
  requirements,
  risk: {
    ignoredRegistrationTypes: ['RLRH', 'RMRH', 'RHRH', 'RVHR'],
  },
}))

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
