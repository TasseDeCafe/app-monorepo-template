import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import {
  GENERATE_TRANSLATION_EXERCISES_PROVIDER_CONFIG,
  type GenerateTranslationExerciseResponse,
} from '../llm-configs'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { langCodeToLanguageName, dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'
import { DbGrammarPattern } from '../../../../database/translation-exercises/translation-exercises-repository'
import { FrequencyLists, selectedWordsInWindow } from '../../../../../utils/frequency-list-utils'
import { getStructuredLlmJson } from '../structured-json-helpers'

export type GeneratedTranslationExercise = GenerateTranslationExerciseResponse

export interface PreviousExerciseWithLearningData {
  mother_language_sentence: string
  study_language_sentence: string
  grammar_patterns: DbGrammarPattern[]
  mother_language_selected_chunks: Array<{ chunk: string[]; chunk_position: number[] }>
  study_language_selected_chunks: Array<{ chunk: string[]; chunk_position: number[] }>
}

const extractDifficultWordsWithExamples = (
  exercise: PreviousExerciseWithLearningData,
  language: 'mother' | 'study'
): { word: string; example: string }[] => {
  const words: { word: string; example: string }[] = []

  const chunkSelections =
    language === 'mother' ? exercise.mother_language_selected_chunks : exercise.study_language_selected_chunks

  const sentence = language === 'mother' ? exercise.mother_language_sentence : exercise.study_language_sentence

  const uniqueWords = new Set<string>()

  // Process each chunk selection
  for (const chunkSelection of chunkSelections) {
    // Extract words from the chunk array
    for (const word of chunkSelection.chunk) {
      if (word && word.trim()) {
        const normalizedWord = word.toLowerCase().trim()
        if (!uniqueWords.has(normalizedWord)) {
          uniqueWords.add(normalizedWord)
          words.push({
            word: normalizedWord,
            example: sentence,
          })
        }
      }
    }
  }

  return words.slice(0, 10) // Max 10 words
}

const extractGrammarPatternsWithExamples = (
  exercise: PreviousExerciseWithLearningData
): { structure: string; concept: string; example: string }[] => {
  const patterns: { structure: string; concept: string; example: string }[] = []
  const sentence = exercise.mother_language_sentence

  for (const pattern of exercise.grammar_patterns) {
    if (pattern && pattern.structure && pattern.concept) {
      patterns.push({
        structure: pattern.structure,
        concept: pattern.concept,
        example: sentence,
      })
    }
  }

  return patterns.slice(0, 10) // Max 10 patterns
}

const buildPrompt = (
  previousExercise: PreviousExerciseWithLearningData | null,
  studyLanguage: SupportedStudyLanguage,
  motherLanguage: LangCode,
  dialect: DialectCode,
  frequencyLists: FrequencyLists
): string => {
  const studyLanguageName = langCodeToLanguageName(studyLanguage)
  const motherLanguageName = langCodeToLanguageName(motherLanguage)
  const dialectName = dialectCodeToDialectName(dialect)

  // Handle the case where we have no previous exercise
  if (!previousExercise) {
    // Get 5 random words from frequency list around position 500 (window 300-700)
    const randomWords = selectedWordsInWindow(frequencyLists, studyLanguage, dialect, 500, 400, 5)
    const wordsText = randomWords.join(', ')

    return `Create a translation exercise for language learning.

**Languages**: ${dialectName} → ${motherLanguageName}

**Your task**: Create a natural, conversational sentence (max 12 words) using ONE of these words: ${wordsText}

**Requirements**:
- Use exactly ONE of the suggested words in your sentence
- Choose an engaging topic (daily life, hobbies, travel, food, etc.)
- Keep it conversational and natural
- Don't try to use multiple suggested words

**Output format** (JSON only):
{
  "study_language_sentence": "[${dialectName} sentence]",
  "mother_language_sentence": "[${motherLanguageName} translation]"
}`
  }

  // For the case where we have a previous exercise
  // Extract difficult elements with examples from this single exercise
  const motherLanguageDifficultWords = extractDifficultWordsWithExamples(previousExercise, 'mother')
  const studyLanguageDifficultWords = extractDifficultWordsWithExamples(previousExercise, 'study')
  const grammarPatterns = extractGrammarPatternsWithExamples(previousExercise)

  // Build sections for difficult elements with examples
  let motherLangWordsSection = ''
  if (motherLanguageDifficultWords.length > 0) {
    const wordsList = motherLanguageDifficultWords
      .map(({ word, example }) => {
        return `- "${word}"\n  Example: "${example}"`
      })
      .join('\n')
    motherLangWordsSection = `
### Challenging ${motherLanguageName} Words to Practice
These words have been difficult for the user to translate:
${wordsList}`
  }

  let studyLangWordsSection = ''
  if (studyLanguageDifficultWords.length > 0) {
    const wordsList = studyLanguageDifficultWords
      .map(({ word, example }) => {
        return `- "${word}"\n  Example: "${example}"`
      })
      .join('\n')
    studyLangWordsSection = `
### ${studyLanguageName} Words User Wants to Remember
These words should be reinforced:
${wordsList}`
  }

  let grammarPatternsSection = ''
  if (grammarPatterns.length > 0) {
    const structuresList = grammarPatterns
      .map(({ structure, concept, example }) => {
        return `- "${structure}" (${concept})\n  Example: "${example}"`
      })
      .join('\n')
    grammarPatternsSection = `
### Grammar Patterns to Practice
These grammar patterns have been challenging for the user:
${structuresList}`
  }

  const hasLearningData = motherLangWordsSection || studyLangWordsSection || grammarPatternsSection

  if (hasLearningData) {
    return `Create a translation exercise for language learning.

**Languages**: ${dialectName} → ${motherLanguageName}

**Your task**: Create a natural, conversational sentence (max 12 words) on any topic.

**Context**: The user previously practiced with words/patterns like these:
${motherLangWordsSection}${studyLangWordsSection}${grammarPatternsSection}

**Important**: You MAY use 1-2 of these elements IF they fit naturally. AVOID creating a sentence that is very similar to the ones in the examples. Variety is more important than using these elements.

**Requirements**:
- Choose a different topic/theme than any examples shown
- Use natural, everyday language
- Keep it conversational and engaging
- Avoid copying sentence structure from examples

**Output format** (JSON only):
{
  "study_language_sentence": "[${dialectName} sentence]",
  "mother_language_sentence": "[${motherLanguageName} translation]"
}`
  } else {
    // No learning data available, use random words for variety
    const randomWords = selectedWordsInWindow(frequencyLists, studyLanguage, dialect, 500, 400, 5)
    const wordsText = randomWords.join(', ')

    return `Create a translation exercise for language learning.

**Languages**: ${dialectName} → ${motherLanguageName}

**Your task**: Create a natural, conversational sentence (max 12 words) using ONE of these words: ${wordsText}

**Requirements**:
- Use exactly ONE of the suggested words in your sentence
- Choose an engaging topic (daily life, hobbies, travel, food, etc.)
- Keep it conversational and natural
- Don't try to use multiple suggested words

**Output format** (JSON only):
{
  "study_language_sentence": "[${dialectName} sentence]",
  "mother_language_sentence": "[${motherLanguageName} translation]"
}`
  }
}

export type GenerateTranslationExerciseResult =
  | {
      isSuccess: true
      exercise: GeneratedTranslationExercise
    }
  | {
      isSuccess: false
    }

export const generateTranslationExercise = async (
  previousExercise: PreviousExerciseWithLearningData | null,
  studyLanguage: SupportedStudyLanguage,
  motherLanguage: LangCode,
  dialect: DialectCode,
  frequencyLists: FrequencyLists
): Promise<GenerateTranslationExerciseResult> => {
  try {
    const prompt = buildPrompt(previousExercise, studyLanguage, motherLanguage, dialect, frequencyLists)
    const structuredResult = await getStructuredLlmJson<GenerateTranslationExerciseResponse>({
      prompt,
      llmConfig: GENERATE_TRANSLATION_EXERCISES_PROVIDER_CONFIG,
      repairInstructions:
        'Both study_language_sentence and mother_language_sentence must be plain text strings without additional fields.',
    })

    if (!structuredResult.success) {
      logWithSentry({
        message: 'Failed to parse structured translation exercise response',
        params: {
          studyLanguage,
          motherLanguage,
          previousExercise,
          attempts: structuredResult.attempts,
          errors: structuredResult.errors,
        },
        error: new Error(structuredResult.errors.at(-1)?.error || 'Unknown LLM structured JSON error'),
      })

      return {
        isSuccess: false,
      }
    }

    const { data: parsed } = structuredResult

    return {
      isSuccess: true,
      exercise: parsed,
    }
  } catch (error) {
    logWithSentry({
      message: 'Failed to generate translation exercises',
      params: { studyLanguage, motherLanguage, previousExercise },
      error,
    })
    return {
      isSuccess: false,
    }
  }
}
