import { SeedFn, seedModule } from './wiremock'
import * as jwt from 'jsonwebtoken'

export const USERNAME = 'USER1'
export const USER_ROLES = ['SOME_USER_ROLE']

const AUTHORIZE_PATH = '/oauth/authorize'
const TOKEN_PATH = '/oauth/token'

const oidcDiscovery: SeedFn = async context => {
  await context.client.hmppsAuth.get('/issuer/.well-known/openid-configuration').returns({
    issuer: context.client.hmppsAuth.resolveUrl('/issuer'),
    authorization_endpoint: context.client.hmppsAuth.resolveUrl(AUTHORIZE_PATH),
    token_endpoint: context.client.hmppsAuth.resolveUrl(TOKEN_PATH),
    jwks_uri: context.client.hmppsAuth.resolveUrl('/.well-known/jwks.json'),
  })
}

const login: SeedFn = async context => {
  await context.client.hmppsAuth
    .get(AUTHORIZE_PATH)
    .query({ response_type: 'code', client_id: 'clientid' })
    .queryMatches({ redirect_uri: '.+', state: '.+' }).html(`<html>
       <body>
         <h1>HMPPS Auth Login</h1>
         <a href="{{ request.query.redirect_uri }}&code=codexxxx&state={{ request.query.state }}">Login</a>
       </body>
     </html>`)
}

function token(username: string): SeedFn {
  return async context => {
    const payload = {
      user_name: username,
      scope: ['read'],
      auth_source: 'delius',
      authorities: [],
      jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
      client_id: 'clientid',
    }

    const token = jwt.sign(payload, 'secret', { expiresIn: '1h' })

    // TODO determine which token is being requested
    await context.client.hmppsAuth.post(TOKEN_PATH).returns({
      access_token: token,
      token_type: 'bearer',
      user_name: username,
      expires_in: 599,
      scope: 'read',
      internalUser: true,
    })
  }
}

function user(username: string): SeedFn {
  return async context => {
    await context.client.hmppsAuth.get('/api/user/me').returns({
      username,
      active: true,
      name: 'john smith',
    })
  }
}

function userRoles(roles: string[]): SeedFn {
  return async context => {
    await context.client.hmppsAuth.get('/api/user/me/roles').returns(roles.map(roleId => ({ roleId })))
  }
}

const logout: SeedFn = async context => {
  await context.client.hmppsAuth.get('/logout').html('<html><body><h1>HMPPS Auth Logout</h1></body></html>')
}

export interface StubHmppsAuthOptions {
  username?: string
  roles?: string[]
}

export function hmppsAuthStub({ username = USERNAME, roles = USER_ROLES }: StubHmppsAuthOptions = {}) {
  return seedModule(
    { title: 'HMPPS auth' },
    oidcDiscovery,
    login,
    token(username),
    user(username),
    userRoles(roles),
    logout,
  )
}
