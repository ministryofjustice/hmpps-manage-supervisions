import { Controller, Get, UseFilters } from '@nestjs/common'
import { HealthService } from './health.service'
import { HealthException, HealthResult } from './types'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { HealthFilter } from './health.filter'
import { Public } from '../security'

@Public()
@Controller('health')
@UseFilters(HealthFilter)
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  get(): Observable<HealthResult> {
    return this.service.getHealth().pipe(
      tap(result => {
        if (!result.healthy) {
          throw new HealthException(result)
        }
      }),
    )
  }

  @Get('ping')
  ping() {
    return { status: 'UP' }
  }
}
