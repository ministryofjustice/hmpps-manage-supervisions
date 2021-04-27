import { Controller, Get } from '../mvc'
import { HealthService } from './health.service'

@Controller('/health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  async get() {
    return this.service.getHealth()
  }

  @Get('ping')
  async ping() {
    await this.service.getHealth()
    return { status: 'UP' }
  }
}
