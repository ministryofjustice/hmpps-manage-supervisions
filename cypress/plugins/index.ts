import { WiremockClient, wiremocker } from './wiremock'
import {
  casesSeed,
  CasesSeedOptions,
  ContactSeedOptions,
  contactsSeed,
  offenderSeed,
  OffenderSeedOptions,
  referenceDataSeed,
  ReferenceDataSeedOptions,
  reset,
} from './seeds'
import { hmppsAuthStub, StubHmppsAuthOptions } from './hmpps-auth'
import { CRN } from './offender'
import { ACTIVE_CONVICTION_ID } from './convictions'
import { DeploymentEnvironment } from '../util'

export type SeedOptions = ReferenceDataSeedOptions &
  OffenderSeedOptions &
  ContactSeedOptions &
  CasesSeedOptions &
  StubHmppsAuthOptions

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  on('task', {
    async resetSeed() {
      await wiremocker([reset], { silent: true })
      return null
    },

    async seed(options: SeedOptions = {}) {
      if (config.env.DEPLOYMENT_ENV !== DeploymentEnvironment.Local) {
        throw new Error(`seeding is unavailable in the ${config.env.DEPLOYMENT_ENV} deployment environment`)
      }

      await wiremocker(
        [
          reset,
          hmppsAuthStub(options),
          referenceDataSeed(options),
          offenderSeed(options),
          contactsSeed(options),
          casesSeed(options),
        ],
        {
          silent: true,
        },
      )
      return null
    },

    async getCreatedAppointments({
      crn = CRN,
      convictionId = ACTIVE_CONVICTION_ID,
    }: {
      crn?: string
      convictionId?: number
    } = {}) {
      const client = new WiremockClient()
      const requests = await client.community.getRequests(
        `/secure/offenders/crn/${crn}/sentence/${convictionId}/appointments`,
      )
      return requests.map(x => JSON.parse(x.request.body))
    },
  })
}

export default pluginConfig
