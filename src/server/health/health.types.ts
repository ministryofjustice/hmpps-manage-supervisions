import { DependentApisConfig } from '../config'

export interface HealthResult {
  healthy: boolean
  checks: Partial<Record<keyof DependentApisConfig, any>>
  uptime: number
  version: string
}

export class HealthException extends Error {
  constructor(public readonly health: HealthResult) {
    super(`the service is unhealthy ${JSON.stringify(health)}`)
  }
}
