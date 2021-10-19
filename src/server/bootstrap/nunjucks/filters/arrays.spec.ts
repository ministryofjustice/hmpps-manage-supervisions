import { ConcatArrays } from './arrays'

describe('array filters', () => {
  it('concatenates messy arrays', () => {
    const observed = new ConcatArrays(null).filter([1, 2], [3], [], null, undefined)
    expect(observed).toEqual([1, 2, 3])
  })
})
