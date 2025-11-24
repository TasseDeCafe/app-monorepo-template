import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { CORRECT_GRAMMAR_PROVIDER_CONFIG } from '../llm-configs'

const buildPrompt = (dialect: DialectCode, text: string) => {
  return `Please fix any grammatical or syntactical errors in this ${dialectCodeToDialectName(
    dialect
  )} text, ensuring correct usage of pronouns, verb conjugations, and overall coherence. Output only the corrected text without any extra commentary:

${text}`
}

export const correctGrammar = async (
  text: string,
  studyLanguage: SupportedStudyLanguage,
  dialect: DialectCode
): Promise<string | null> => {
  try {
    const grammarCheckPrompt = buildPrompt(dialect, text)

    const correctionResponse = getLlmReplyWithFallback(grammarCheckPrompt, CORRECT_GRAMMAR_PROVIDER_CONFIG)

    if (!correctionResponse) {
      logWithSentry({
        message: 'Failed to generate grammar correction',
        params: { studyLanguage, dialect, llmConfig: CORRECT_GRAMMAR_PROVIDER_CONFIG },
        error: 'empty response from llm',
      })
      return null
    }
    return correctionResponse
  } catch (error) {
    logWithSentry({
      message: 'fatal error in correctGrammar',
      params: { studyLanguage, dialect, llmConfig: CORRECT_GRAMMAR_PROVIDER_CONFIG },
      error,
    })
    return null
  }
}
