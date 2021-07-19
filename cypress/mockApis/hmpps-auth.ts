import { WireMockClient } from './wiremock-client'
import * as jwt from 'jsonwebtoken'
import PluginConfigOptions = Cypress.PluginConfigOptions

function createToken(): string {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'delius',
    authorities: [],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

export class HmppsAuthMockApi {
  private readonly baseUrl: string

  constructor(private readonly client: WireMockClient, config: PluginConfigOptions) {
    this.baseUrl = config.baseUrl
  }

  async stubPing() {
    await this.client.stubPing('auth')
  }

  async stubAuthorizeCodeFlow() {
    return this.client.stub({
      request: {
        method: 'GET',
        urlPath: '/auth/oauth/authorize',
        queryParameters: {
          response_type: { equalTo: 'code' },
          client_id: { equalTo: 'clientid' },
          redirect_uri: { matches: '.+' },
          state: { matches: '.+' },
        },
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: `<html>
                 <body>
                   <h1>HMPPS Auth Login</h1>
                   <a href="{{ request.query.redirect_uri }}&code=codexxxx&state={{ request.query.state }}">Login</a>
                 </body>
               </html>`,
        transformers: ['response-template'],
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
        body: '<html><body><h1>HMPPS Auth Logout</h1></body></html>',
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
