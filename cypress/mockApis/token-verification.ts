import { WireMockClient } from './wiremock-client'

export class TokenVerificationMockApi {
  constructor(private readonly client: WireMockClient) {}

  async stubPing() {
    await this.client.stubPing('token-verification')
  }

  async stubVerifyToken() {
    return this.client.stub({
      request: {
        method: 'POST',
        urlPattern: '/token-verification/token/verify',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { active: 'true' },
      },
    })
  }
}
