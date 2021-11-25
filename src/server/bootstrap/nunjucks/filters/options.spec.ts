import { SeparateOr } from './options'

describe('options filters', () => {
  describe('SeparateOr', () => {
    it('separates or option with a divider', () => {
      const outcomes = [
        { value: 'AAAA', text: 'Other' },
        { value: 'AFTC', text: 'Failed to Comply' },
      ]
      const observed = new SeparateOr(null).filter(outcomes, 'value', 'AAAA')
      expect(observed).toEqual([
        { value: 'AFTC', text: 'Failed to Comply' },
        { divider: 'or' },
        { value: 'AAAA', text: 'Other' },
      ])
    })

    it('does not introduce a separator when no or option is found', () => {
      const outcomes = [
        { value: 'XXXX', text: 'Some option' },
        { value: 'AFTC', text: 'Failed to Comply' },
      ]
      const observed = new SeparateOr(null).filter(outcomes, 'value', 'AAAA')
      expect(observed).toEqual([
        { value: 'XXXX', text: 'Some option' },
        { value: 'AFTC', text: 'Failed to Comply' },
      ])
    })
  })
})
