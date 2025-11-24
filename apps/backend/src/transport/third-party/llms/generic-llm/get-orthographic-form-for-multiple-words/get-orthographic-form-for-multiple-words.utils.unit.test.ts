import { describe, expect, it } from 'vitest'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { buildPrompt } from './get-orthographic-form-for-multiple-words'

describe('get-orthographic-form-for-multiple-words', () => {
  describe('buildPrompt', () => {
    it('should return the correct prompt for English with 3 words', () => {
      const text = "HELLO World, it's Alice!"
      const wordsWithoutPunctuation = ['HELLO', 'World', "it's", 'Alice']
      const language = LangCode.ENGLISH

      const expectedPrompt = `
Here is a text in English with 4 target words:
"HELLO World, it's Alice!"

Respond with JSON only, no markdown or explanation:
{
  "orthographic_forms": [
    "[orthographic form of HELLO]",
    "[orthographic form of World]",
    "[orthographic form of it's]",
    "[orthographic form of Alice]"
  ]
}

Rules:
- Keep 4 entries, preserving the original order of the words.
- Each entry must be a single word (no spaces) and should preserve accents/diacritics.
- Adjust capitalization to the dictionary form (e.g., proper nouns capitalized, common words lowercase).
- Do not add extra keys or commentary.

Example:
Input: "You and I LOVE Egypt, it's my colleague Thomas's country. Thomas worked at the ZenVibe company."
Output:
{
  "orthographic_forms": [
    "you",
    "and",
    "I",
    "love",
    "Egypt",
    "it's",
    "my",
    "colleague",
    "Thomas's",
    "country",
    "Thomas",
    "worked",
    "at",
    "the",
    "ZenVibe",
    "company"
  ]
}
`

      const prompt = buildPrompt(text, wordsWithoutPunctuation, language)
      expect(prompt).toBe(expectedPrompt)
    })
  })
})
