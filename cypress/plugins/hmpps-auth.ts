import { ApiName, SeedFn, seedModule } from './wiremock'
import * as jwt from 'jsonwebtoken'

export const USERNAME = 'USER1'
export const USER_ROLES = ['SOME_USER_ROLE']

const AUTHORIZE_PATH = '/oauth/authorize'
const TOKEN_PATH = '/oauth/token'
const AUTHORIZATION_CODE = 'some-authorization-code'
export const TOKEN_PAYLOADS = {
  deliusUser: {
    sub: USERNAME,
    client_id: 'api-client-id',
    user_id: '2500000001',
    user_name: USERNAME,
    auth_source: 'delius',
    name: 'Some User',
    scope: ['read', 'write'],
    authorities: ['ROLE_COMMUNITY_INTERVENTIONS_UPDATE', 'ROLE_COMMUNITY'],
    iss: 'http://localhost:9091/hmpps-auth/issuer',
    iat: 1629150415,
    exp: 4784787795,
    jti: 'delius-user',
  },
  clientCredentials: {
    sub: 'system-client-id',
    client_id: 'system-client-id',
    auth_source: 'none',
    database_username: 'SystemClientUser',
    scope: ['read', 'write'],
    authorities: ['ROLE_COMMUNITY_INTERVENTIONS_UPDATE', 'ROLE_COMMUNITY'],
    iss: 'http://localhost:9091/hmpps-auth/issuer',
    iat: 1629150415,
    exp: 4784787795,
    jti: 'api-client-credentials',
  },
}

type Tokens = keyof typeof TOKEN_PAYLOADS

/**
 * These tokens are signed with a symmetric key & have hard coded iat, exp & jti claims so their signatures are static.
 */
export const TOKENS: Record<Tokens, string> = Object.entries(TOKEN_PAYLOADS)
  .map(([k, v]) => ({ [k]: jwt.sign(v, 'hmpps-auth-secret') }))
  .reduce((x, y) => ({ ...x, ...y })) as any

const oidcDiscovery: SeedFn = context =>
  context.client.hmppsAuth.get('/issuer/.well-known/openid-configuration').returns({
    issuer: context.client.hmppsAuth.resolveUrl('/issuer'),
    authorization_endpoint: context.client.hmppsAuth.resolveUrl(AUTHORIZE_PATH),
    token_endpoint: context.client.hmppsAuth.resolveUrl(TOKEN_PATH),
    jwks_uri: context.client.hmppsAuth.resolveUrl('/.well-known/jwks.json'),
  })

const login: SeedFn = context =>
  context.client.hmppsAuth
    .get(AUTHORIZE_PATH)
    .query({ response_type: 'code', client_id: 'api-client-id' })
    .queryMatches({ redirect_uri: '.+', state: '.+' }).html(`<html>
       <body>
         <h1>HMPPS Auth Login</h1>
         <a href="{{ request.query.redirect_uri }}&code=${AUTHORIZATION_CODE}&state={{ request.query.state }}">Login</a>
       </body>
     </html>`)

/**
 * Stub the token granted for subject authorization code flow.
 */
const authorizationCodeToken: SeedFn = context => {
  context.client.hmppsAuth
    .post(TOKEN_PATH)
    .basicAuth('api-client-id', 'api-client-secret')
    .formData({
      grant_type: 'authorization_code',
      code: AUTHORIZATION_CODE,
    })
    .returns({
      access_token: TOKENS.deliusUser,
      token_type: 'bearer',
      user_name: USERNAME,
      expires_in: 600,
    })
}

/**
 * Stub the token granted for client credentials flow.
 */
const clientCredentialsToken: SeedFn = context => {
  context.client.hmppsAuth
    .post(TOKEN_PATH)
    .basicAuth('system-client-id', 'system-client-secret')
    .formData({
      grant_type: 'client_credentials',
      username: USERNAME,
    })
    .returns({
      access_token: TOKENS.clientCredentials,
      token_type: 'bearer',
      user_name: USERNAME,
      expires_in: 600,
    })
}

const user: SeedFn = context =>
  context.client.hmppsAuth.get('/api/user/me').returns({
    username: USERNAME,
    active: true,
    name: 'john smith',
  })

function userRoles(roles: string[]): SeedFn {
  return context => context.client.hmppsAuth.get('/api/user/me/roles').returns(roles.map(roleId => ({ roleId })))
}

const logout: SeedFn = context =>
  context.client.hmppsAuth.get('/logout').html('<html><body><h1>HMPPS Auth Logout</h1></body></html>')

function requireBearerToken(api: ApiName, token: Tokens): SeedFn {
  return context => context.client.mutate(api, x => x.bearer(TOKENS[token]))
}

export interface StubHmppsAuthOptions {
  username?: string
  roles?: string[]
}

export function hmppsAuthStub({ roles = USER_ROLES }: StubHmppsAuthOptions = {}) {
  return seedModule(
    { title: 'HMPPS auth' },
    oidcDiscovery,
    login,
    authorizationCodeToken,
    clientCredentialsToken,
    user,
    userRoles(roles),
    logout,
    requireBearerToken('community', 'clientCredentials'),
    requireBearerToken('assessRisksAndNeeds', 'clientCredentials'),
  )
}
