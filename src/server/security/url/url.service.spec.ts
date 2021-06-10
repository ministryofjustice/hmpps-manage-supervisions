import { Test } from '@nestjs/testing'
import { UrlService } from './url.service'
import { FakeConfigModule } from '../../config/config.fake'
import { URL } from 'url'

describe('UrlService', () => {
  let service: UrlService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UrlService],
      imports: [FakeConfigModule.register({ server: { domain: new URL('http://some-domain') } })],
    }).compile()

    service = module.get(UrlService)
  })

  it('passes through local redirect', () => {
    const observed = service.sanitiseRedirectUrl({ query: { redirect: '/work' } } as any)
    expect(observed).toBe('/work')
  })

  it('passes through absolute redirect to local domain', () => {
    const observed = service.sanitiseRedirectUrl({ query: { redirect: 'http://some-domain/work' } } as any)
    expect(observed).toBe('http://some-domain/work')
  })

  it('returns default when empty', () => {
    const observed = service.sanitiseRedirectUrl({ query: {} } as any)
    expect(observed).toBe('/')
  })

  it('returns default when open redirect', () => {
    const observed = service.sanitiseRedirectUrl({ query: { redirect: 'http://google.com' } } as any)
    expect(observed).toBe('/')
  })
})
