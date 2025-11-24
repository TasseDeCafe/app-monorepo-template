import { logCustomErrorMessageAndError, logWithSentry } from '../../../sentry/error-monitoring'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { buildPrompt } from './get-orthographic-form-for-multiple-words.utils'
import {
  GET_ORTHOGRAPHIC_FORMS_FOR_MULTIPLE_WORDS_PROVIDER_CONFIG,
  type GetOrthographicFormsResponse,
} from '../llm-configs'
import { getStructuredLlmJson } from '../structured-json-helpers'

// const APOSTROPHES_REGEX = /[\u2018\u2019\u201B\u2032]/g

// const normalizeForComparison = (value: string): string => {
//   return value.trim().replace(APOSTROPHES_REGEX, "'").normalize('NFC').toLowerCase()
// }

export type GetOrthographicFormsForMultipleWordsResult =
  | {
      isSuccess: true
      orthographicForms: string[]
    }
  | {
      isSuccess: false
    }

export const getOrthographicFormsForMultipleWords = async (
  text: string,
  wordsWithoutPunctuation: string[],
  language: LangCode
): Promise<GetOrthographicFormsForMultipleWordsResult> => {
  try {
    const prompt = buildPrompt(text, wordsWithoutPunctuation, language)
    const structuredResult = await getStructuredLlmJson<GetOrthographicFormsResponse>({
      prompt,
      llmConfig: GET_ORTHOGRAPHIC_FORMS_FOR_MULTIPLE_WORDS_PROVIDER_CONFIG,
      repairInstructions: `Return JSON with exactly ${wordsWithoutPunctuation.length} items in orthographic_forms, each a single word without spaces.`,
      validateData: ({ orthographic_forms }) => {
        if (orthographic_forms.length !== wordsWithoutPunctuation.length) {
          return `orthographic_forms must contain exactly ${wordsWithoutPunctuation.length} entries`
        }

        for (const form of orthographic_forms) {
          const trimmed = form.trim()
          if (trimmed.length === 0) {
            return 'orthographic_forms entries must not be empty'
          }

          if (trimmed.split(/\s+/).length !== 1) {
            return 'orthographic_forms entries must be single words without spaces'
          }
        }

        return null
      },
    })

    if (!structuredResult.success) {
      logWithSentry({
        message: 'Failed to parse orthographic forms response',
        params: {
          text,
          wordsWithoutPunctuation,
          language,
          attempts: structuredResult.attempts,
          errors: structuredResult.errors,
        },
        error: new Error(structuredResult.errors.at(-1)?.error || 'Unknown orthographic forms structured JSON error'),
      })
      return {
        isSuccess: false,
      }
    }

    const orthographicForms = structuredResult.data.orthographic_forms.map((form) => form.trim())

    // todo: this check is incorrect, see for example this log:
    // https://grammarians.sentry.io/issues/7009943151/?environment=production&project=4507670591373312&query=is%3Aunresolved&referrer=issue-stream
    // it clearly doesn't just check if the LLM has changed characters
    // do not re-enable this without a fix.
    // if (orthographicForms.length === wordsWithoutPunctuation.length) {
    //   // llm should change case only, we need this check to see if it got too creative
    //   let hasLLMChangedCharacters = false
    //   for (let i = 0; i < orthographicForms.length; i++) {
    //     const normalizedGenerated = normalizeForComparison(orthographicForms[i])
    //     const normalizedOriginal = normalizeForComparison(wordsWithoutPunctuation[i])
    //     if (normalizedGenerated !== normalizedOriginal) {
    //       hasLLMChangedCharacters = true
    //       break
    //     }
    //   }
    //   if (hasLLMChangedCharacters) {
    //     // todo: consider sending this to analytics instead of logging it
    //     // we used to log it here, but it's too noisy
    //     logMessage(
    //       `getOrthographicFormsForMultipleWords: llm changed characters instead of only changing case, wordsWithoutPunctuation - ${JSON.stringify(
    //         wordsWithoutPunctuation
    //       )}, orthographicForms - ${JSON.stringify(orthographicForms)}`,
    //       true
    //     )
    //   }
    // }

    return {
      isSuccess: true,
      orthographicForms,
    }
  } catch (error) {
    logCustomErrorMessageAndError('getOrthographicFormsForMultipleWords - error', error)
    return {
      isSuccess: false,
    }
  }
}

export { buildPrompt }
