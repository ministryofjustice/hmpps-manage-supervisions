import { ConcatArrays, SortBy } from './arrays'

describe('array filters', () => {
  describe('ConcatArrays', () => {
    it('concatenates messy arrays', () => {
      const observed = new ConcatArrays(null).filter([1, 2], [3], [], null, undefined)
      expect(observed).toEqual([1, 2, 3])
    })
  })

  describe('SortBy', () => {
    it('sorts arrays of objects by a key', () => {
      const observed = new SortBy(null).filter([{ k: 'b' }, { k: 'a' }], 'k')
      expect(observed).toEqual([{ k: 'a' }, { k: 'b' }])
    })
  })
})
