import { Test } from '@nestjs/testing'
import * as nock from 'nock'
import { HmppsOidcService } from './hmpps-oidc.service'
import { MockCacheModule, MockCacheService } from '../cache/cache.mock'
import { AuthApiConfig } from '../../config'
import { FakeConfigModule } from '../../config/config.fake'
import * as faker from 'faker'
import { ConfigService } from '@nestjs/config'
import { fakeUser } from '../../security/user/user.fake'

describe('HmppsOidcService', () => {
  let subject: HmppsOidcService
  let cache: MockCacheService
  let user: User
  let apiConfig: AuthApiConfig

  beforeEach(async () => {
    user = fakeUser()
    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register(), MockCacheModule.register()],
      providers: [HmppsOidcService],
    }).compile()

    subject = module.get(HmppsOidcService)
    cache = module.get(MockCacheService)
    apiConfig = module.get(ConfigService).get('apis.hmppsAuth')

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
