import 'reflect-metadata'

/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import createApp from './server/app'
import logger from './logger'

createApp()
  .then(app => {
    app.listen(app.get('port'), () => {
      logger.info(`Server listening on port ${app.get('port')}`)
    })
  })
  .catch(err => {
    throw err
  })
