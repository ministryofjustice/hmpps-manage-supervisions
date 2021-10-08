import { DependentApisConfig } from '../config'
import { OpenApiVersionReport } from './open-api-version/open-api-version.types'

export interface HealthResult {
  healthy: boolean
  checks: Partial<Record<keyof DependentApisConfig, any>>
  uptime: number
  version: string
  services: Partial<Record<keyof DependentApisConfig, OpenApiVersionReport>>
}

export class HealthException extends Error {
  constructor(public readonly health: HealthResult) {
    super(`the service is unhealthy ${JSON.stringify(health)}`)
  }
}
