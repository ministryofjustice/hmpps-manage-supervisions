import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import * as nock from 'nock'
import { HealthService } from './health.service'
import { DependentApisConfig, ServerConfig } from '../config'
import { FakeConfigModule } from '../config/config.fake'
import { OpenApiVersionService } from './open-api-version'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { fakeOpenApiVersionReport } from './health.fake'
import { HealthResult } from './health.types'

describe('HealthService', () => {
  let subject: HealthService
  let config: DependentApisConfig
  let server: ServerConfig
  let versionService: SinonStubbedInstance<OpenApiVersionService>
  const communityApiVersion = fakeOpenApiVersionReport()
  const assessRisksAndNeedsApiVersion = fakeOpenApiVersionReport()

  beforeEach(async () => {
    versionService = createStubInstance(OpenApiVersionService)
    const module = await Test.createTestingModule({
      imports: [
        FakeConfigModule.register({
          apis: {
            hmppsAuth: { enabled: true },
            community: { enabled: true },
            tokenVerification: { enabled: false },
          },
        }),
      ],
      providers: [HealthService, { provide: OpenApiVersionService, useValue: versionService }],
    }).compile()

    subject = module.get<HealthService>(HealthService)
    config = module.get(ConfigService).get('apis')
    server = module.get(ConfigService).get('server')

    versionService.versionReport.withArgs('community').resolves(communityApiVersion)
    versionService.versionReport.withArgs('assessRisksAndNeeds').resolves(assessRisksAndNeedsApiVersion)
  })

  function havingHealthyApi(api: keyof DependentApisConfig, up = true) {
    const [status, data] = up ? [200, 'UP'] : [503, 'DOWN']
    nock(config[api].url.href).get('/health/ping').reply(status, { status: data })
  }

  it('should be healthy when all services are healthy', async () => {
    havingHealthyApi('hmppsAuth')
    havingHealthyApi('community')
    havingHealthyApi('assessRisksAndNeeds')
    const { uptime, ...observed } = await subject.getHealth()
    expect(observed).toEqual({
      healthy: true,
      checks: { hmppsAuth: { status: 'UP' }, community: { status: 'UP' }, assessRisksAndNeeds: { status: 'UP' } },
      version: server.version,
      services: {
        community: communityApiVersion,
        assessRisksAndNeeds: assessRisksAndNeedsApiVersion,
      },
    } as HealthResult)
  })

  it('should be unhealthy when any service is unhealthy', async () => {
    havingHealthyApi('hmppsAuth', false)
    havingHealthyApi('community')
    havingHealthyApi('assessRisksAndNeeds')
    const { uptime, ...observed } = await subject.getHealth()
    expect(observed).toEqual({
      healthy: false,
      checks: { hmppsAuth: { status: 'DOWN' }, community: { status: 'UP' }, assessRisksAndNeeds: { status: 'UP' } },
      version: server.version,
      services: {
        community: communityApiVersion,
        assessRisksAndNeeds: assessRisksAndNeedsApiVersion,
      },
    } as HealthResult)
  })
})
