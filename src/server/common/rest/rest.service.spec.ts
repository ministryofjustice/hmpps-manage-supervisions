import { Test } from '@nestjs/testing'
import { RestService } from './rest.service'
import * as nock from 'nock'
import { FakeConfigModule } from '../../config/config.fake'
import { ApiConfig } from '../../config'
import { ConfigService } from '@nestjs/config'
import { fakeUser } from '../../security/user/user.fake'
import { SanitisedAxiosError } from './SanitisedAxiosError'
import { SinonStubbedInstance, createStubInstance } from 'sinon'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { Logger } from '@nestjs/common'

const URL = '/some-url'
const OK = Object.freeze({ hello: 'world' })

describe('RestClientService', () => {
  let subject: RestService
  let user: User
  let config: ApiConfig
  let oidc: SinonStubbedInstance<HmppsOidcService>

  beforeEach(async () => {
    user = fakeUser()
    oidc = createStubInstance(HmppsOidcService)

    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register()],
      providers: [RestService, { provide: HmppsOidcService, useValue: oidc }],
    })
      .setLogger(new Logger())
      .compile()

    subject = module.get(RestService)
    config = module.get(ConfigService).get('apis.community')
  })

  it('succeeds without retry', async () => {
    nock(config.url).matchHeader('authorization', `Bearer ${user.token}`).get(URL).reply(200, OK)
    const observed = await subject.build('community', user).get(URL)
    expect(observed.data).toEqual(OK)
  })

  it('succeeds after single retry', async () => {
    const bad = nock(config.url).matchHeader('authorization', `Bearer ${user.token}`).get(URL).reply(500)
    const ok = bad.get(URL).reply(200, OK)
    const observed = await subject.build('community', user).get(URL)
    expect(observed.data).toEqual(OK)
    expect(bad.isDone()).toBe(true)
    expect(ok.isDone()).toBe(true)
  })

  it('fails after 3 retries', async () => {
    nock(config.url)
      .matchHeader('authorization', `Bearer ${user.token}`)
      .get(URL)
      .reply(500)
      .get(URL)
      .reply(500)
      .get(URL)
      .reply(500)
      .get(URL)
      .reply(500)
    await expect(subject.build('community', user).get(URL)).rejects.toThrow(SanitisedAxiosError)
  })
})
