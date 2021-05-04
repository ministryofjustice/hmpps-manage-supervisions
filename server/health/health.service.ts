import { Service } from 'typedi'
import { HealthClient, ServiceCheck } from './health.client'
import { ConfigService, DependentApisConfig } from '../config'
import { HealthResult } from './types'
import { HealthException } from '../mvc'
import ApplicationVersion from '../applicationVersion'

@Service({ global: true })
export class HealthService {
  private readonly serviceChecks: ServiceCheck[]

  constructor(client: HealthClient, config: ConfigService) {
    this.serviceChecks = Object.entries(config.apis)
      .filter(([, api]) => api.enabled)
      .map(([name, api]) => client.serviceCheckFactory(name as keyof DependentApisConfig, api))
  }

  async getHealth(): Promise<HealthResult> {
    const checks = await Promise.all(this.serviceChecks.map(x => x()))
    const result = {
      healthy: checks.length === 0 || checks.every(x => x.healthy),
      checks: checks.reduce((agg, x) => ({ ...agg, [x.name]: x.result }), {}),
      uptime: process.uptime(),
      build: ApplicationVersion.buildInfo,
      version: ApplicationVersion.buildNumber,
    }

    if (!result.healthy) {
      throw new HealthException(result)
    }

    return result
  }
}
