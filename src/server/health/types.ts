import { DependentApisConfig } from '../config'

export interface HealthResult {
  healthy: boolean
  checks: Partial<Record<keyof DependentApisConfig, any>>
  uptime: number
  build?: { buildNumber: string; gitRef: string }
  version?: string
}

export class HealthException extends Error {
  constructor(public readonly health: HealthResult) {
    super(`the service is unhealthy ${JSON.stringify(health)}`)
  }
}
