import { Test } from '@nestjs/testing'
import { OpenApiVersionService } from './open-api-version.service'
import { FakeConfigModule } from '../../config/config.fake'
import { MockRestModule } from '../../common/rest/rest.mock'
import { AuthenticationMethod } from '../../common'
import MockAdapter from 'axios-mock-adapter'
import { DateTime } from 'luxon'
import { OpenApiVersionReport, OpenApiVersionReportSummary } from './open-api-version.types'
import { ApiConfig } from '../../config'
import { ConfigService } from '@nestjs/config'

describe('OpenApiVersionService', () => {
  let subject: OpenApiVersionService
  let client: MockAdapter
  let config: ApiConfig

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OpenApiVersionService],
      imports: [
        FakeConfigModule.register({
          apis: { community: { specVersion: '2021-09-30.6493.2a1a56b' } },
        }),
        MockRestModule.register([
          {
            name: 'community',
            authMethod: AuthenticationMethod.None,
            user: null,
          },
        ]),
      ],
    }).compile()

    subject = module.get(OpenApiVersionService)
    client = module.get(MockRestModule.CLIENT)
    config = module.get(ConfigService).get('apis.community')
  })

  function havingLocalVersion(version: string) {
    config.specVersion = version
  }

  function havingRemoteVersion(version: string) {
    client.onGet('/info').reply(200, { build: { version } })
  }

  function whenGettingVersionReport() {
    return subject.versionReport('community')
  }

  it('is ok when versions are equal', async () => {
    havingRemoteVersion('2021-09-30.6493.2a1a56b')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: false,
      local: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      remote: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      result: OpenApiVersionReportSummary.Ok,
    } as OpenApiVersionReport)
  })

  it('is bad remote version when remote version is before local version', async () => {
    havingRemoteVersion('2021-09-30.6492.2a1a56b')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: true,
      local: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      remote: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6492,
      },
      result: OpenApiVersionReportSummary.BadRemoteVersion,
    } as OpenApiVersionReport)
  })

  it('is local out of date when remote version is after local version', async () => {
    havingRemoteVersion('2021-09-30.6494.2a1a56b')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: false,
      local: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      remote: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6494,
      },
      result: OpenApiVersionReportSummary.LocalSpecOutOfDate,
    } as OpenApiVersionReport)
  })

  it('is unknown when remote spec is bad', async () => {
    havingRemoteVersion('2021-09-30')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: true,
      local: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      remote: null,
      result: OpenApiVersionReportSummary.Unknown,
    } as OpenApiVersionReport)
  })

  it('is unknown when local spec bad but remote spec good', async () => {
    havingLocalVersion('2021-09-30')
    havingRemoteVersion('2021-09-30.6493.2a1a56b')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: true,
      local: null,
      remote: {
        date: DateTime.fromISO('2021-09-30'),
        gitSha: '2a1a56b',
        buildNumber: 6493,
      },
      result: OpenApiVersionReportSummary.Unknown,
    } as OpenApiVersionReport)
  })

  it('is unknown when local spec bad and remote spec also bad', async () => {
    havingLocalVersion('some-non-semver')
    havingRemoteVersion('some-non-semver')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: true,
      local: null,
      remote: null,
      result: OpenApiVersionReportSummary.Unknown,
    } as OpenApiVersionReport)
  })

  it('is unknown when local spec missing', async () => {
    config.specVersion = null
    havingRemoteVersion('some-non-semver')
    const result = await whenGettingVersionReport()
    expect(result).toEqual({
      isError: true,
      local: null,
      remote: null,
      result: OpenApiVersionReportSummary.Unknown,
    } as OpenApiVersionReport)
  })
})
