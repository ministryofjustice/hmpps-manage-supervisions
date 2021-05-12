import { setup, defaultClient, DistributedTracingModes } from 'applicationinsights'
import { ApplicationVersion } from '../util'

const enabled = process.env.APPINSIGHTS_INSTRUMENTATIONKEY
if (enabled) {
  console.log('Starting azure application insights')
  setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).setAutoCollectConsole(true, true).start()
  defaultClient.context.tags['ai.cloud.role'] = ApplicationVersion.packageData.name
  defaultClient.context.tags['ai.application.ver'] = ApplicationVersion.buildNumber
} else {
  console.log('Application insights is disabled')
}
