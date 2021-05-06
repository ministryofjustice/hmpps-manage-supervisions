import { WireMockClient } from '../mockApis/wiremock-client'
import { HmppsAuthMockApi } from '../mockApis/hmpps-auth'
import { TokenVerificationMockApi } from '../mockApis/token-verification'
import { CommunityMockApi, CreateAppointmentArgs } from '../mockApis/community-api'

const pluginConfig: Cypress.PluginConfig = (on, config) => {
  const client = new WireMockClient()
  const auth = new HmppsAuthMockApi(client, config.baseUrl)
  const tokenVerification = new TokenVerificationMockApi(client)
  const communityApi = new CommunityMockApi(client)

  on('task', {
    async reset() {
      await client.reset()
      return await Promise.all([auth, tokenVerification, communityApi].map(x => x.stubPing()))
    },

    getLoginUrl: () => auth.getLoginUrl(),
    getLoginAttempts: () => auth.getLoginAttempts(),
    getLogoutAttempts: () => auth.getLogoutAttempts(),
    stubLogin: () =>
      Promise.all([auth.stubToken(), auth.stubRedirect(), auth.stubLogout(), auth.stubOpenIdConfiguration()]),
    stubAuthUser: () => Promise.all([auth.stubUser(), auth.stubUserRoles()]),

    stubCreateAppointment(args: CreateAppointmentArgs) {
      return communityApi.stubCreateAppointment(args)
    },
    getCreatedAppointments(args: CreateAppointmentArgs) {
      return communityApi.getCreatedAppointments(args)
    },
  })
}

export default pluginConfig
