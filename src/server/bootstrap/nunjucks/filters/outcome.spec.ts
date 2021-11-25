import { TranslateOutcomes } from './outcome'

describe('outcome filters', () => {
  describe('TranslateOutcomes', () => {
    it('translates fields on outcomes', () => {
      const outcomes = [{ code: 'AFTC', description: 'Attended - Failed to Comply' }]
      const observed = new TranslateOutcomes(null).filter(outcomes)
      expect(observed).toEqual([{ code: 'AFTC', description: 'Failed to comply' }])
    })

    it('does not translate unknown fields', () => {
      const outcomes = [{ code: '????', description: 'Leave me be' }]
      const observed = new TranslateOutcomes(null).filter(outcomes)
      expect(observed).toEqual([{ code: '????', description: 'Leave me be' }])
    })

    it('replaces offenderFirstName if specified', () => {
      const outcomes = [{ code: 'RSOF', description: 'This field is irrelevant' }]
      const observed = new TranslateOutcomes(null).filter(outcomes, 'Liz')
      expect(observed).toEqual([{ code: 'RSOF', description: 'Reschedule requested by Liz' }])
    })
  })
})
