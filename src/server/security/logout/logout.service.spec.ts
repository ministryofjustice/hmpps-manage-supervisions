import { URL } from 'url'
import { Test } from '@nestjs/testing'
import { LogoutService } from './logout.service'
import { FakeConfigModule } from '../../config/config.fake'

describe('LogoutService', () => {
  let subject: LogoutService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LogoutService],
      imports: [
        FakeConfigModule.register({
          apis: {
            hmppsAuth: { externalUrl: new URL('http://hmpps-auth'), apiClientCredentials: { id: 'some-client-id' } },
          },
          server: { domain: new URL('http://domain') },
        }),
      ],
    }).compile()

    subject = module.get(LogoutService)
  })

  it('gets logout url', () => {
    const url = subject.getLogoutUrl()
    expect(url).toBe('http://hmpps-auth/logout?client_id=some-client-id&redirect_uri=http%3A%2F%2Fdomain%2F')
  })
})
