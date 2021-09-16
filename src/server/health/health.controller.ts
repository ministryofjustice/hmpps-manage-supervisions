import { Controller, Get, UseFilters } from '@nestjs/common'
import { HealthService } from './health.service'
import { HealthException, HealthResult } from './health.types'
import { HealthFilter } from './health.filter'
import { Public } from '../security'

@Public()
@Controller('health')
@UseFilters(HealthFilter)
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  async get(): Promise<HealthResult> {
    const result = await this.service.getHealth()
    if (!result.healthy) {
      throw new HealthException(result)
    }
    return result
  }

  @Get('ping')
  ping() {
    return { status: 'UP' }
  }
}
