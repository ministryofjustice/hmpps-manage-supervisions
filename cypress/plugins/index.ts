import { WireMockClient } from '../mockApis/wiremock-client'
import { HmppsAuthMockApi } from '../mockApis/hmpps-auth'
import { TokenVerificationMockApi } from '../mockApis/token-verification'
import { CommunityMockApi } from '../mockApis/community-api'
import PluginConfigOptions = Cypress.PluginConfigOptions

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  const client = new WireMockClient()
  const auth = new HmppsAuthMockApi(client, config)

  const tasks: Cypress.Tasks = {
    reset: () => client.reset(),

    stubLogin: () =>
      Promise.all([auth.stubToken(), auth.stubRedirect(), auth.stubLogout(), auth.stubOpenIdConfiguration()]),
    stubAuthUser: () => Promise.all([auth.stubUser(), auth.stubUserRoles()]),
  }

  function mergeTasks<T>(Api: { new (client: WireMockClient, config?: PluginConfigOptions): T }) {
    const api = new Api(client, config)
    for (const key of Object.getOwnPropertyNames(Api.prototype).filter(x => x != 'constructor')) {
      if (key in tasks) {
        const existing = tasks[key]
        tasks[key] = (options?: any) => Promise.all([existing(options), api[key](options)])
      } else {
        tasks[key] = (options?: any) => api[key](options)
      }
    }
  }

  mergeTasks(HmppsAuthMockApi)
  mergeTasks(TokenVerificationMockApi)
  mergeTasks(CommunityMockApi)

  on('task', tasks)
}

export default pluginConfig
