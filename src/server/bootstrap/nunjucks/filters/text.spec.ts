import { Environment } from 'nunjucks'
import { NoOrphans, SafeNotes } from './text'

describe('text filters', () => {
  describe('NoOrphans', () => {
    it('removes orphan words from long strings of text', () => {
      const observed = new NoOrphans(null).filter('foo bar baz')
      expect(observed).toEqual('foo bar&nbsp;baz')
    })
  })

  describe('SafeNotes', () => {
    it('trims trailing and leading whitespace', () => {
      const observed = new SafeNotes(new Environment()).filter(' \ntext\nbreak \n ')
      expect(observed).toEqual({ length: 16, val: 'text<br />\nbreak' })
    })

    it('strips evil tags', () => {
      const observed = new SafeNotes(new Environment()).filter('<a href="#evil">not evil</a>')
      expect(observed).toEqual({ length: 8, val: 'not evil' })
    })

    it('escapes reserved HTML characters', () => {
      const observed = new SafeNotes(new Environment()).filter('JavaScript > TypeScript')
      expect(observed).toEqual({ length: 26, val: 'JavaScript &gt; TypeScript' })
    })

    it('converts newlines to <br>', () => {
      const observed = new SafeNotes(new Environment()).filter(
        'Sir, I bear a rhyme excelling\nIn mystic force and magic spelling',
      )
      expect(observed).toEqual({
        length: 70,
        val: 'Sir, I bear a rhyme excelling<br />\nIn mystic force and magic spelling',
      })
    })

    it('converts safe URLs to anchor tags', () => {
      const observed = new SafeNotes(new Environment()).filter('Brought to you by https://gov.uk')
      expect(observed).toEqual({ length: 61, val: 'Brought to you by <a href="https://gov.uk">https://gov.uk</a>' })
    })
  })
})
