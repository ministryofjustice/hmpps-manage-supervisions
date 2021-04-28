import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Service } from 'typedi'
import logger from '../../logger'
import { ApiConfig, DependentApisConfig } from '../config'

export type ServiceCheck = () => Promise<ServiceHealthResult>

export interface ServiceHealthResult {
  name: keyof DependentApisConfig
  healthy: boolean
  result: Error | string
}

@Service()
export class HealthClient {
  serviceCheckFactory(
    name: keyof DependentApisConfig,
    { url, agent, timeout }: ApiConfig,
    path = '/health/ping',
  ): ServiceCheck {
    const keepaliveAgent = url.startsWith('https') ? new HttpsAgent(agent) : new Agent(agent)
    const failure = (error: Error) => ({ name, healthy: false, result: error })

    return async () => {
      try {
        const result = await superagent
          .get(url + path)
          .agent(keepaliveAgent)
          .retry(2, (err, res) => {
            if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message} when calling ${name}`)
            return undefined // retry handler only for logging retries, not to influence retry logic
          })
          .timeout(timeout)
        if (result.status >= 200 && result.status < 300) {
          return { name, healthy: true, result: 'OK' }
        }
        return failure(new Error(`api returned non-success http status code ${result.status}`))
      } catch (error) {
        logger.error(error.stack, `Error calling ${name}`)
        return failure(error)
      }
    }
  }
}
