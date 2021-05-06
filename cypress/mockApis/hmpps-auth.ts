import { WireMockClient } from './wiremock-client'
import * as jwt from 'jsonwebtoken'

function createToken(): string {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities: [],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

export class HmppsAuthMockApi {
  constructor(private readonly client: WireMockClient, private readonly baseUrl: string) {}

  async stubPing() {
    await this.client.stubPing('auth')
  }

  async getLoginUrl() {
    const requests = await this.client.getRequests('/auth/oauth/authorize')
    const state = requests.find(x => x)?.request.queryParams.state?.values?.find(x => x)
    if (!state) {
      throw new Error('no /auth/oauth/authorize request found')
    }
    return `/login/callback?code=codexxxx&state=${state}`
  }

  async getLoginAttempts() {
    return await this.client.getRequests('/auth/oauth/authorize')
  }

  async getLogoutAttempts() {
    return await this.client.getRequests('/auth/logout')
  }

  async stubRedirect() {
    return this.client.stub({
      request: {
        method: 'GET',
        // TODO extract query params
        urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=clientid',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          Location: this.baseUrl + '/login/callback?code=codexxxx&state=stateyyyy',
        },
        body: '<html><body>Login page<h1>Sign in</h1></body></html>',
      },
    })
  }

  async stubLogout() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPattern: '/auth/logout.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<html><body>Logout page<h1>Logged out</h1></body></html>',
      },
    })
  }

  async stubToken() {
    return this.client.stub({
      request: {
        method: 'POST',
        urlPattern: '/auth/oauth/token',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Location: this.baseUrl + '/login/callback?code=codexxxx&state=stateyyyy',
        },
        jsonBody: {
          access_token: createToken(),
          token_type: 'bearer',
          user_name: 'USER1',
          expires_in: 599,
          scope: 'read',
          internalUser: true,
        },
      },
    })
  }

  async stubUser() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPattern: '/auth/api/user/me',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          staffId: 231232,
          username: 'USER1',
          active: true,
          name: 'john smith',
        },
      },
    })
  }

  async stubUserRoles() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPattern: '/auth/api/user/me/roles',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [{ roleId: 'SOME_USER_ROLE' }],
      },
    })
  }

  async stubOpenIdConfiguration() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPattern: '/auth/issuer/.well-known/openid-configuration',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          issuer: 'http://localhost:9091/auth/issuer',
          authorization_endpoint: 'http://localhost:9091/auth/oauth/authorize',
          token_endpoint: 'http://localhost:9091/auth/oauth/token',
          jwks_uri: 'http://localhost:9091/auth/.well-known/jwks.json',
        },
      },
    })
  }
}
