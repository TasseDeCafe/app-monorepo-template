import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { ANALYZE_GRAMMAR_PATTERNS_PROVIDER_CONFIG, type AnalyzeGrammarPatternsResponse } from '../llm-configs'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { getStructuredLlmJson } from '../structured-json-helpers'

export type GrammarPattern = AnalyzeGrammarPatternsResponse['patterns'][number]

const buildGrammarPatternsPrompt = (
  motherLanguageSentence: string,
  studyLanguageSentence: string,
  studyLanguage: LangCode,
  motherLanguage: LangCode
): string => {
  const motherLanguageName = langCodeToLanguageName(motherLanguage)
  const studyLanguageName = langCodeToLanguageName(studyLanguage)

  return `You are a language learning expert analyzing translation pairs to identify challenging grammar patterns. Your task is to identify grammatical structures, expressions, or linguistic patterns in the ${motherLanguageName} sentence that learners might find difficult to translate into ${studyLanguageName}.

IMPORTANT: You must respond with ONLY valid JSON. Do not include any explanation, markdown formatting, or additional text.

## Input
- Native Language (${motherLanguageName}): "${motherLanguageSentence}"
- Study Language (${studyLanguageName}): "${studyLanguageSentence}"

## Task
Find 0-5 grammar patterns in the ${motherLanguageName} sentence that could pose translation challenges. For each pattern:
1. Extract the core grammatical structure (use "..." for variable parts)
2. Provide the corresponding structure in ${studyLanguageName} 
3. Give a simple explanation

## Required JSON Output Format
{
  "patterns": [
    {
      "structure": "exact phrase or construction from native sentence",
      "hint": "corresponding structure/phrase in study language",
      "concept": "simple explanation of what this pattern represents"
    }
  ]
}

Focus on: verb forms, idiomatic expressions, sentence structures, prepositions, word order differences, and unique grammatical constructions.

Return ONLY the JSON object, nothing else:`
}

export type GenerateGrammarPatternsResult =
  | {
      isSuccess: true
      patterns: GrammarPattern[]
    }
  | {
      isSuccess: false
    }

export const generateGrammarPatterns = async (
  motherLanguageSentence: string,
  studyLanguageSentence: string,
  studyLanguage: LangCode,
  motherLanguage: LangCode
): Promise<GenerateGrammarPatternsResult> => {
  try {
    const prompt = buildGrammarPatternsPrompt(
      motherLanguageSentence,
      studyLanguageSentence,
      studyLanguage,
      motherLanguage
    )

    const structuredResult = await getStructuredLlmJson<AnalyzeGrammarPatternsResponse>({
      prompt,
      llmConfig: ANALYZE_GRAMMAR_PATTERNS_PROVIDER_CONFIG,
      repairInstructions: 'Return an object with a patterns array. Each item must include structure and concept keys.',
    })

    if (!structuredResult.success) {
      logWithSentry({
        message: 'Failed to parse structured grammar patterns response',
        params: {
          motherLanguageSentence,
          studyLanguageSentence,
          studyLanguage,
          motherLanguage,
          attempts: structuredResult.attempts,
          errors: structuredResult.errors,
        },
        error: new Error(structuredResult.errors.at(-1)?.error || 'Unknown LLM structured JSON error'),
      })

      return {
        isSuccess: false,
      }
    }

    const { data } = structuredResult

    return {
      isSuccess: true,
      patterns: data.patterns,
    }
  } catch (error) {
    logWithSentry({
      message: 'Failed to generate grammar patterns',
      params: { motherLanguageSentence, studyLanguageSentence, studyLanguage, motherLanguage },
      error,
    })
    return {
      isSuccess: false,
    }
  }
}
