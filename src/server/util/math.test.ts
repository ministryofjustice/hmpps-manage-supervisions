import { quantity } from './math'

describe('math utils', () => {
  it('gets default zero', () => {
    const observed = quantity(0, 'thing')
    expect(observed).toEqual('0 things')
  })

  it('gets custom zero', () => {
    const observed = quantity(0, 'thing', { zero: 'No' })
    expect(observed).toEqual('No things')
  })

  it('gets singular', () => {
    const observed = quantity(1, 'thing')
    expect(observed).toEqual('1 thing')
  })

  it('gets plural', () => {
    const observed = quantity(2, 'thing')
    expect(observed).toEqual('2 things')
  })

  it('gets custom plural', () => {
    const observed = quantity(2, 'Address', { plural: 'es' })
    expect(observed).toEqual('2 Addresses')
  })

  it('gets empty plural', () => {
    const observed = quantity(2, 'things', { emitPlural: false })
    expect(observed).toEqual('2 thing')
  })

  it('overrides plural', () => {
    const observed = quantity(2, 'things', { overridePlural: 'something else' })
    expect(observed).toEqual('2 something else')
  })
})
