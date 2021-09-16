import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import * as nock from 'nock'
import { HealthService } from './health.service'
import { DependentApisConfig, ServerConfig } from '../config'
import { FakeConfigModule } from '../config/config.fake'

describe('HealthService', () => {
  let service: HealthService
  let config: DependentApisConfig
  let server: ServerConfig

  beforeEach(async () => {
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
      providers: [HealthService],
    }).compile()

    service = module.get<HealthService>(HealthService)
    config = module.get(ConfigService).get('apis')
    server = module.get(ConfigService).get('server')
  })

  function havingHealthyApi(api: keyof DependentApisConfig, up = true) {
    const [status, data] = up ? [200, 'UP'] : [503, 'DOWN']
    nock(config[api].url.href).get('/health/ping').reply(status, { status: data })
  }

  it('should be healthy when all services are healthy', async () => {
    havingHealthyApi('hmppsAuth')
    havingHealthyApi('community')
    havingHealthyApi('assessRisksAndNeeds')
    const { uptime, ...observed } = await service.getHealth()
    expect(observed).toEqual({
      healthy: true,
      checks: { hmppsAuth: { status: 'UP' }, community: { status: 'UP' }, assessRisksAndNeeds: { status: 'UP' } },
      version: server.version,
    })
  })

  it('should be unhealthy when any service is unhealthy', async () => {
    havingHealthyApi('hmppsAuth', false)
    havingHealthyApi('community')
    havingHealthyApi('assessRisksAndNeeds')
    const { uptime, ...observed } = await service.getHealth()
    expect(observed).toEqual({
      healthy: false,
      checks: { hmppsAuth: { status: 'DOWN' }, community: { status: 'UP' }, assessRisksAndNeeds: { status: 'UP' } },
      version: server.version,
    })
  })
})
