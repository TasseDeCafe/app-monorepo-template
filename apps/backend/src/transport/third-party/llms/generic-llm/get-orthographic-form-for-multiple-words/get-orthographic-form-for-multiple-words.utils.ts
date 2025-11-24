import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { languageToExampleSentenceAndOrthographicForms } from './example-sentences-to-orthographic-forms'
import { langCodeToLanguageName } from '../../../../../utils/lang-code-utils'

const buildPlaceholderArray = (words: string[]): string => {
  const lines = words.map((word) => `    ${JSON.stringify(`[orthographic form of ${word.trim() || word}]`)}`)
  return `[\n${lines.join(',\n')}\n  ]`
}

export const buildPrompt = (text: string, wordsWithoutPunctuation: string[], language: LangCode): string => {
  const languageName = langCodeToLanguageName(language)
  const [exampleText, , exampleOrthographicForms] =
    languageToExampleSentenceAndOrthographicForms[language as SupportedStudyLanguage]
  const exampleJson = JSON.stringify({ orthographic_forms: exampleOrthographicForms }, null, 2)
  const placeholderArray = buildPlaceholderArray(wordsWithoutPunctuation)

  return `
Here is a text in ${languageName} with ${wordsWithoutPunctuation.length} target words:
"${text}"

Respond with JSON only, no markdown or explanation:
{
  "orthographic_forms": ${placeholderArray}
}

Rules:
- Keep ${wordsWithoutPunctuation.length} entries, preserving the original order of the words.
- Each entry must be a single word (no spaces) and should preserve accents/diacritics.
- Adjust capitalization to the dictionary form (e.g., proper nouns capitalized, common words lowercase).
- Do not add extra keys or commentary.

Example:
Input: "${exampleText}"
Output:
${exampleJson}
`
}
