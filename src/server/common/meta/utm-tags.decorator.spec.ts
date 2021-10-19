import { utmFactory } from './utm-tags.decorator'
import { Utm, UtmMedium, UtmSource } from '../links'

describe('UtmTags', () => {
  it('ignores missing tags', () => {
    const observed = utmFactory({})
    expect(observed).toBeNull()
  })

  it('ignores partial tags', () => {
    const observed = utmFactory({
      utm_medium: 'some-medium',
      utm_campaign: 'some-campaign',
    })
    expect(observed).toBeNull()
  })

  it('parses tags without content', () => {
    const observed = utmFactory({
      utm_source: 'app',
      utm_medium: 'risk',
      utm_campaign: 'some-campaign',
    })
    expect(observed).toEqual({
      source: UtmSource.App,
      medium: UtmMedium.Risk,
      campaign: 'some-campaign',
      content: null,
    } as Utm)
  })

  it('parses tags with content', () => {
    const observed = utmFactory({
      utm_source: 'app',
      utm_medium: 'risk',
      utm_campaign: 'some-campaign',
      utm_content: 'someKey_abc.someOtherKey_1',
    })
    expect(observed).toEqual({
      source: UtmSource.App,
      medium: UtmMedium.Risk,
      campaign: 'some-campaign',
      content: {
        someKey: 'abc',
        someOtherKey: '1',
      },
    } as Utm)
  })
})
