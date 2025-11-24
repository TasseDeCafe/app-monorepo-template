import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG } from '../llm-configs'

export type CorrectGrammarAndExplainResult = {
  correction: string | null
  explanation: string | null
}

const buildPrompt = (dialect: DialectCode, motherLanguage: LangCode, text: string) => {
  return `Please analyze this ${dialectCodeToDialectName(
    dialect
  )} text for grammar and spelling errors (and not punctuation errors). Return a JSON object with two fields:
{
  "correction": the corrected version of the text with proper grammar,
  "explanation": a brief explanation in ${motherLanguage} of the grammar mistakes in the text
}

Text to analyze:
${text}


Return = {"correction": string, "explanation": string}
`
}

export const correctGrammarAndExplainMistakes = async (
  text: string,
  motherLanguage: LangCode,
  language: LangCode,
  dialect: DialectCode
): Promise<CorrectGrammarAndExplainResult> => {
  try {
    const prompt = buildPrompt(dialect, motherLanguage, text)

    const response: string | null = await getLlmReplyWithFallback(prompt, CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG)

    if (!response) {
      logWithSentry({
        message: 'Failed to generate grammar correction and explanation',
        params: { text, motherLanguage, language, dialect, llmConfig: CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG },
        error: 'Empty response from llm',
      })
      return { correction: null, explanation: null }
    }

    try {
      const json = JSON.parse(response) as CorrectGrammarAndExplainResult
      return {
        correction: json.correction || null,
        explanation: json.explanation || null,
      }
    } catch (parseError) {
      logWithSentry({
        message: 'Failed to parse grammar correction and explanation response',
        params: { motherLanguage, language, dialect, llmConfig: CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG },
        error: parseError,
      })
      return { correction: null, explanation: null }
    }
  } catch (error) {
    logWithSentry({
      message: 'Failed to correct grammar and explain mistakes',
      params: { motherLanguage, language, dialect, llmConfig: CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG },
      error,
    })
    return { correction: null, explanation: null }
  }
}
