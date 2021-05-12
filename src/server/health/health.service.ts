import { HttpService, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthResult } from './types'
import { ApiConfig, Config, DependentApisConfig, ServerConfig } from '../config'
import { urlJoin } from '../util'
import { catchError, map } from 'rxjs/operators'
import { combineLatest, Observable, of } from 'rxjs'

interface ServiceHealthResult {
  name: keyof DependentApisConfig
  healthy: boolean
  result: string
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(private readonly http: HttpService, private readonly config: ConfigService<Config>) {}

  getHealth(): Observable<HealthResult> {
    const server = this.config.get<ServerConfig>('server')
    const checks = Object.entries(this.config.get<DependentApisConfig>('apis'))
      .filter(([, api]) => api.enabled)
      .map(([name, api]) => this.service(name as keyof DependentApisConfig, api))
    return combineLatest(checks).pipe(
      map(results => ({
        healthy: results.length === 0 || results.every(x => x.healthy),
        checks: results.reduce((agg, x) => ({ ...agg, [x.name]: x.result }), {}),
        uptime: process.uptime(),
        build: server.build,
        version: server.version,
      })),
    )
  }

  private service(name: keyof DependentApisConfig, config: ApiConfig): Observable<ServiceHealthResult> {
    return this.http.get(urlJoin(config.url, 'health', 'ping'), { timeout: config.timeout }).pipe(
      map(() => ({ name, healthy: true, result: 'OK' })),
      catchError(err => {
        const message = err.response?.data || err.message
        this.logger.error(`${name} is unhealthy ${message}`)
        return of({ name, healthy: false, result: message })
      }),
    )
  }
}
