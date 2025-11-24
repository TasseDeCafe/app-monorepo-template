import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { GET_ORTHOGRAPHIC_FORM_FOR_WORD_PROVIDER_CONFIG, type GetOrthographicFormResponse } from '../llm-configs'
import { logMessage, logCustomErrorMessageAndError, logWithSentry } from '../../../sentry/error-monitoring'
import { getStructuredLlmJson } from '../structured-json-helpers'

export const buildGetOrthographicFormForWordPrompt = (
  language: LangCode,
  contextWords: string[],
  selectedWordIndex: number
): string => {
  const contextSentence = contextWords
    .map((word, index) => (index === selectedWordIndex ? `<${word}>` : word))
    .join(' ')

  return `You are standardizing word capitalization for dictionary entries.

Context language: ${langCodeToLanguageName(language)}
Sentence: "${contextSentence}"

Return JSON only, no markdown.
{
  "orthographic_form": "[dictionary form of the word inside angle brackets]"
}

Guidelines:
- Preserve accents/diacritics exactly
- Do not add extra words
- Keep the word as a single token without spaces
- No explanations or additional keys
`
}

export const getOrthographicFormForWord = async (
  language: LangCode,
  contextWords: string[],
  selectedWordIndex: number
): Promise<string | null> => {
  try {
    const prompt = buildGetOrthographicFormForWordPrompt(language, contextWords, selectedWordIndex)
    const structuredResult = await getStructuredLlmJson<GetOrthographicFormResponse>({
      prompt,
      llmConfig: GET_ORTHOGRAPHIC_FORM_FOR_WORD_PROVIDER_CONFIG,
      repairInstructions:
        'Return JSON with a single key orthographic_form containing exactly one word without spaces or explanations.',
      validateData: ({ orthographic_form }) => {
        const trimmed = orthographic_form.trim()
        if (trimmed.length === 0) {
          return 'orthographic_form must not be empty'
        }

        if (trimmed.split(/\s+/).length !== 1) {
          return 'orthographic_form must be a single word without spaces'
        }

        return null
      },
    })

    if (!structuredResult.success) {
      logWithSentry({
        message: 'Failed to parse orthographic form response',
        params: {
          language,
          contextWords,
          selectedWordIndex,
          attempts: structuredResult.attempts,
          errors: structuredResult.errors,
        },
        error: new Error(structuredResult.errors.at(-1)?.error || 'Unknown orthographic form structured JSON error'),
      })
      return null
    }

    const orthographicForm = structuredResult.data.orthographic_form.trim()

    if (orthographicForm.length === 0) {
      logMessage('getOrthographicFormForWord: orthographic form became empty after trimming')
      return null
    }

    return orthographicForm
  } catch (error) {
    logCustomErrorMessageAndError('getOrthographicFormForWord - error', error)
    return null
  }
}
