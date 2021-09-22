import { ApiName, SeedFn, seedModule } from './wiremock'
import * as jwt from 'jsonwebtoken'

// must be upper case
export const USERNAME = 'MANAGE_SUPERVISIONS'

interface MockRole {
  authorities: string[]
  deliusName: string
}

export enum Role {
  None = 'none',
  Read = 'read',
  Write = 'write',
}

const ROLES: Record<Role, MockRole> = {
  none: { authorities: [], deliusName: null },
  read: { authorities: ['ROLE_MANAGE_SUPERVISIONS_RO'], deliusName: 'MASBT001' },
  write: { authorities: ['ROLE_MANAGE_SUPERVISIONS_RO', 'ROLE_MANAGE_SUPERVISIONS'], deliusName: 'MASBT002' },
}

const AUTHORIZE_PATH = '/oauth/authorize'
const TOKEN_PATH = '/oauth/token'
const AUTHORIZATION_CODE = 'some-authorization-code'

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
function authorizationCodeToken(token: string): SeedFn {
  return context => {
    context.client.hmppsAuth
      .post(TOKEN_PATH)
      .basicAuth('api-client-id', 'api-client-secret')
      .formBody({
        grant_type: 'authorization_code',
        code: AUTHORIZATION_CODE,
      })
      .returns({
        access_token: token,
        token_type: 'bearer',
        user_name: USERNAME,
        expires_in: 600,
      })
  }
}

/**
 * Stub the token granted for client credentials flow.
 */
function clientCredentialsToken(token: string): SeedFn {
  return context => {
    context.client.hmppsAuth
      .post(TOKEN_PATH)
      .basicAuth('system-client-id', 'system-client-secret')
      .formBody({
        grant_type: 'client_credentials',
        username: USERNAME,
      })
      .returns({
        access_token: token,
        token_type: 'bearer',
        user_name: USERNAME,
        expires_in: 600,
      })
  }
}

const user: SeedFn = context =>
  context.client.hmppsAuth.get('/api/user/me').returns({
    username: USERNAME,
    active: true,
    name: 'john smith',
  })

const logout: SeedFn = context =>
  context.client.hmppsAuth.get('/logout').html('<html><body><h1>HMPPS Auth Logout</h1></body></html>')

function requireBearerToken(api: ApiName, token: string): SeedFn {
  return context => context.client.mutate(api, x => x.bearer(token))
}

export interface StubHmppsAuthOptions {
  username?: string
  role?: Role
}

/**
 * Stub the entire hmpps-auth UI, token & authorize endpoints.
 * Modify all community API & assess risks & needs API endpoints to require the client credentials bearer token.
 * This is only to be used where a real instance of hmpps-auth is unavailable or unpractical i.e. e2e tests.
 */
export function hmppsAuthStub({ username = USERNAME, role = Role.Write }: StubHmppsAuthOptions = {}) {
  const SECRET = 'hmpps-auth-secret'
  const tokens = {
    deliusUser: jwt.sign(
      {
        sub: username,
        client_id: 'api-client-id',
        user_id: '2500000001',
        user_name: username,
        auth_source: 'delius',
        name: 'Some User',
        scope: ['read', 'write'],
        authorities: ROLES[role].authorities,
        iss: 'http://localhost:9091/hmpps-auth/issuer',
        iat: 1629150415,
        exp: 4784787795,
        jti: 'delius-user',
      },
      SECRET,
    ),
    clientCredentials: jwt.sign(
      {
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
      SECRET,
    ),
  }

  return seedModule(
    { title: 'HMPPS auth' },
    oidcDiscovery,
    login,
    authorizationCodeToken(tokens.deliusUser),
    clientCredentialsToken(tokens.clientCredentials),
    user,
    logout,
    requireBearerToken('community', tokens.clientCredentials),
    requireBearerToken('assessRisksAndNeeds', tokens.clientCredentials),
  )
}

/**
 * Stub the delius LDAP APIs on community API.
 * These are used by the real hmpps-auth to authenticate delius users.
 * This is only to be used when a real hmpps-auth instance is available i.e. local development.
 */
export function deliusLdap({ username = USERNAME, role = Role.Write }: StubHmppsAuthOptions = {}) {
  return seedModule({ title: 'Delius LDAP' }, context => {
    // TODO case insensitive
    context.client.community.get(`/secure/users/${username}/details`).returns({
      userId: 2500000001,
      firstName: 'Gordon',
      surname: 'Smith',
      email: 'manage-supervisions@digital.justice.gov.uk',
      enabled: true,
      roles: [{ name: ROLES[role].deliusName }].filter(x => x.name),
      username: username,
    })
    context.client.community.post('/secure/authenticate').jsonBody({ username, password: 'password123456' }).emptyOk()
  })
}
