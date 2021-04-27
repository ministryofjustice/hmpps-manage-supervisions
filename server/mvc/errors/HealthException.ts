import { HealthResult } from '../../health/types'

export class HealthException extends Error {
  constructor(public readonly health: HealthResult) {
    super(`the service is unhealthy ${JSON.stringify(health)}`)
  }
}
