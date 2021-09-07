import { Test } from '@nestjs/testing'
import { FakeConfigModule } from '../../config/config.fake'
import { LoginGuard } from './login.guard'
import { URL } from 'url'
import { LoginService } from './login.service'
import { createStubInstance } from 'sinon'

describe('LoginGuard', () => {
  let subject: LoginGuard
  const request: any = {}

  const context: any = {
    switchToHttp: () => ({ getRequest: () => request }),
  }

  beforeEach(async () => {
    const service = createStubInstance(LoginService)
    service.sanitiseRedirectUrl.withArgs(request).returns('/redirect-url')

    const module = await Test.createTestingModule({
      imports: [FakeConfigModule.register({ server: { domain: new URL('http://some-domain') } })],
      providers: [LoginGuard, { provide: LoginService, useValue: service }],
    }).compile()

    subject = module.get(LoginGuard)
  })

  it('sets callback with redirect url', () => {
    const observed = subject.getAuthenticateOptions(context)
    expect(observed).toEqual({ callbackURL: 'http://some-domain/login/callback?redirect=%2Fredirect-url' })
  })
})
