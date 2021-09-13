import { WiremockClient, wiremocker } from './wiremock'
import {
  reset,
  ReferenceDataSeedOptions,
  referenceDataSeed,
  CasesSeedOptions,
  casesSeed,
  offenderSeed,
  OffenderSeedOptions,
  ContactSeedOptions,
  contactsSeed,
} from './seeds'
import { hmppsAuthStub, StubHmppsAuthOptions } from './hmpps-auth'
import { CRN } from './offender'
import { ACTIVE_CONVICTION_ID } from './convictions'

export type SeedOptions = ReferenceDataSeedOptions &
  OffenderSeedOptions &
  ContactSeedOptions &
  CasesSeedOptions &
  StubHmppsAuthOptions

const pluginConfig: Cypress.PluginConfig = on => {
  on('task', {
    async resetSeed() {
      await wiremocker([reset], { silent: true })
      return null
    },

    async seed(options: SeedOptions = {}) {
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
