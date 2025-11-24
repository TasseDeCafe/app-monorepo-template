import { describe, expect, it } from 'vitest'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { _buildPrompt, _removeSlashesFromIpaWord } from './generate-ipa-utils'

describe('generate-ipa', () => {
  describe('buildPrompt', () => {
    it('should return the correct prompt for French with 7 words', () => {
      const words = ['je', 'ne', 'sais', 'pas', 'quoi', 'te', 'dire']
      const language = LangCode.FRENCH
      const dialect = DialectCode.PARISIAN_FRENCH

      const expectedPrompt = `
Here is a text in French that contains 7 words. Transcribe each word in IPA by filling in the missing information in the list below. 

---

1 -- je -- <INSERT IPA OF "je" HERE>
2 -- ne -- <INSERT IPA OF "ne" HERE>
3 -- sais -- <INSERT IPA OF "sais" HERE>
4 -- pas -- <INSERT IPA OF "pas" HERE>
5 -- quoi -- <INSERT IPA OF "quoi" HERE>
6 -- te -- <INSERT IPA OF "te" HERE>
7 -- dire -- <INSERT IPA OF "dire" HERE>

---

For example, if the text is "portez ce vieux whisky au juge blond qui fume", the response should follow this format:

---

1 -- portez -- pɔʁ.te
2 -- ce -- sə
3 -- vieux -- vjø
4 -- whisky -- wis.ki
5 -- au -- o
6 -- juge -- ʒyʒ
7 -- blond -- blɔ̃
8 -- qui -- ki
9 -- fume -- fym

---

Make sure that there are exactly 7 words in the text and that the format is always the one shown above.

The IPA transcription should be in Parisian French. If the text is not in the language I specified, detect the language and transcribe it in the language you detected.

DO NOT ADD ANY OTHER COMMENTS OR TEXT.
`

      const prompt = _buildPrompt(words, language, dialect)
      expect(prompt).toBe(expectedPrompt)
    })
  })
  describe('_removeSlashesFromIpaWord', () => {
    it('works for multiple cases', () => {
      expect(_removeSlashesFromIpaWord('/hoʊl/')).toBe('hoʊl')
      expect(_removeSlashesFromIpaWord('/a/')).toBe('a')
      expect(_removeSlashesFromIpaWord('a')).toBe('a')
      expect(_removeSlashesFromIpaWord('/')).toBe('/')
      expect(_removeSlashesFromIpaWord('')).toBe('')
    })
  })
})
