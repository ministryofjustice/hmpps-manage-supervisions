import { Injectable, Logger } from '@nestjs/common'
import Axios from 'axios'
import { ConfigService } from '@nestjs/config'
import { HealthResult } from './health.types'
import { ApiConfig, Config, DependentApisConfig, ServerConfig } from '../config'
import { urlJoin } from '../util'

interface ServiceHealthResult {
  name: keyof DependentApisConfig
  healthy: boolean
  result: string
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly config: ConfigService<Config>) {}

  async getHealth(): Promise<HealthResult> {
    const { version } = this.config.get<ServerConfig>('server')
    const promises = Object.entries(this.config.get<DependentApisConfig>('apis'))
      .filter(([, api]) => api.enabled)
      .map(([name, api]) => this.service(name as keyof DependentApisConfig, api))

    const results = await Promise.all(promises)
    return {
      healthy: results.length === 0 || results.every(x => x.healthy),
      checks: results.reduce((agg, x) => ({ ...agg, [x.name]: x.result }), {}),
      uptime: process.uptime(),
      version,
    }
  }

  private async service(name: keyof DependentApisConfig, { url }: ApiConfig): Promise<ServiceHealthResult> {
    try {
      const result = await Axios.get(urlJoin(url, 'health', 'ping'), { timeout: 5000 })
      return { name, healthy: true, result: result.data }
    } catch (err) {
      const reason = (Axios.isAxiosError(err) && err.response?.data) || err.message || null
      this.logger.error(`${name} is unhealthy`, { reason, service: name })
      return { name, healthy: false, result: reason }
    }
  }
}
