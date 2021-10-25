import { Test } from '@nestjs/testing'
import { RestService } from './rest.service'
import * as nock from 'nock'
import { FakeConfigModule } from '../../config/config.fake'
import { ApiConfig } from '../../config'
import { ConfigService } from '@nestjs/config'
import { fakeUser } from '../../security/user/user.fake'
import { createStubInstance, SinonStubbedInstance } from 'sinon'
import { HmppsOidcService } from '../hmpps-oidc/hmpps-oidc.service'
import { HttpStatus, Logger } from '@nestjs/common'
import { MockLoggerModule } from '../../logger/logger.mock'
import { SanitisedAxiosError } from './SanitisedAxiosError'
import { omit } from 'lodash'

nock.disableNetConnect()

const URL = '/some-url'
const OK = Object.freeze({ hello: 'world' })

describe('RestService', () => {
  let subject: RestService
  let user: User
  let config: ApiConfig
  let oidc: SinonStubbedInstance<HmppsOidcService>

  beforeEach(async () => {
    user = fakeUser()
    oidc = createStubInstance(HmppsOidcService)

    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register(), MockLoggerModule],
      providers: [RestService, { provide: HmppsOidcService, useValue: oidc }],
    })
      .setLogger(new Logger())
      .compile()

    subject = module.get(RestService)
    config = module.get(ConfigService).get('apis.community')
  })

  it('does not retry 404', async () => {
    nock(config.url.href)
      .matchHeader('authorization', `Bearer ${user.token}`)
      .get(URL)
      .reply(404, { developerMessage: 'this is not found' })

    expect.assertions(3)
    await subject
      .build('community', user)
      .get(URL)
      .catch((err: SanitisedAxiosError) => {
        expect(err).toBeInstanceOf(SanitisedAxiosError)
        expect(err.response?.status ?? 'no response').toBe(HttpStatus.NOT_FOUND)
        expect(err.retries).toBe(0)
      })
  })

  it('succeeds without retry', async () => {
    nock(config.url.href).matchHeader('authorization', `Bearer ${user.token}`).get(URL).reply(200, OK)
    const observed = await subject.build('community', user).get(URL)
    expect(observed.data).toEqual(OK)
  })

  it('succeeds after retry', async () => {
    const bad = nock(config.url.href).matchHeader('authorization', `Bearer ${user.token}`).get(URL).reply(500)
    const ok = bad.get(URL).reply(200, OK)
    const observed = await subject.build('community', user).get(URL)
    expect(observed.data).toEqual(OK)
    expect(bad.isDone()).toBe(true)
    expect(ok.isDone()).toBe(true)
  })

  it('fails after retry', async () => {
    nock(config.url.href)
      .matchHeader('authorization', `Bearer ${user.token}`)
      .get(URL)
      .reply(500)
      .get(URL)
      .reply(500, { error: 'some error' })

    expect.assertions(2)
    await subject
      .build('community', user)
      .get(URL)
      .catch((err: SanitisedAxiosError) => {
        expect({ ...omit(err, 'responseTime'), message: err.message }).toEqual({
          message: 'Request failed with status code 500',
          api: {
            baseUrl: config.url.href,
            name: 'community',
          },
          name: 'SanitisedAxiosError',
          request: {
            method: 'GET',
            url: URL,
          },
          response: {
            data: { error: 'some error' },
            status: 500,
            statusText: null,
          },
          retries: 1,
        })
        expect(err.responseTime).toBeGreaterThanOrEqual(0)
      })
  })
})
