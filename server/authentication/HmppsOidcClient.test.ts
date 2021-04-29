import nock from 'nock'
import { HmppsOidcClient } from './HmppsOidcClient'
import { MockCacheService } from '../data/CacheService.mock'
import { AuthApiConfig, ConfigService } from '../config'
import { fakeConfig } from '../config/config.fake'
import { fakeUserPrincipal } from './user.fake'
import * as faker from 'faker'

describe('HmppsOidcClient', () => {
  let cache: MockCacheService
  let config: ConfigService
  let subject: HmppsOidcClient
  let user: UserPrincipal
  let apiConfig: AuthApiConfig

  beforeEach(() => {
    cache = new MockCacheService()
    config = fakeConfig()
    subject = new HmppsOidcClient(cache as any, config)
    user = fakeUserPrincipal()
    apiConfig = config.apis.hmppsAuth
    havingDiscovery()
  })

  function havingDiscovery() {
    const discovery = {
      issuer: apiConfig.url,
      grant_types_supported: ['client_credentials'],
      scopes_supported: ['some-scope'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      token_endpoint: apiConfig.url + '/token',
    }
    nock(apiConfig.url).get('/issuer/.well-known/openid-configuration').reply(200, discovery)
  }

  it('getting fresh delius user token', async () => {
    const accessToken = faker.datatype.uuid()
    nock(apiConfig.url)
      .post('/token', `grant_type=client_credentials&username=${user.username}`)
      .basicAuth({ user: apiConfig.systemClientCredentials.id, pass: apiConfig.systemClientCredentials.secret })
      .reply(200, {
        access_token: accessToken,
        expires_in: 600,
        token_type: 'Bearer',
      })

    const result = await subject.getDeliusUserToken(user)

    expect(result).toBe(accessToken)
  })

  it('getting cached delius user token', async () => {
    const accessToken = faker.datatype.uuid()
    cache.cache[`oidc:client_credentials:${apiConfig.systemClientCredentials.id}:delius:${user.username}`] = accessToken
    const result = await subject.getDeliusUserToken(user)
    expect(result).toBe(accessToken)
  })
})
