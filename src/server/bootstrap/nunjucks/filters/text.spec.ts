import { NoOrphans } from './text'

describe('text filters', () => {
  it('removes orphan words from long strings of text', () => {
    const observed = new NoOrphans(null).filter('foo bar baz')
    expect(observed).toEqual('foo bar&nbsp;baz')
  })
})
