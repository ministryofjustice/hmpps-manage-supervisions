import { setup, defaultClient, DistributedTracingModes } from 'applicationinsights'
import { getApplicationInfo } from '../util'

const enabled = process.env.APPINSIGHTS_INSTRUMENTATIONKEY
if (enabled) {
  console.log('Starting azure application insights')
  setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).setAutoCollectConsole(true, true).start()
  const { version, name } = getApplicationInfo()
  defaultClient.context.tags['ai.cloud.role'] = name
  if (version) {
    defaultClient.context.tags['ai.application.ver'] = version
  }
} else {
  console.log('Application insights is disabled')
}
