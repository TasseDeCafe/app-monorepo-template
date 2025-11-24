import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { FrequencyLists, selectedWordsInWindow } from '../../../../../utils/frequency-list-utils'
import { dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { languageSpecificPrompt } from './generate-exercise-from-frequency-list.utils'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { GENERATE_EXERCISE_FROM_FREQUENCY_LIST_PROVIDER_CONFIG } from '../llm-configs'

const buildPrompt = (
  wordLength: number,
  dialect: DialectCode,
  selectedWords: string[],
  language: LangCode,
  topics: Topic[]
): string => {
  const topicSection =
    topics.length === 1 ? `Write the text as if you're having a natural conversation about ${topics[0]}.` : ''

  return `Write a conversational text of about ${wordLength} words in ${dialectCodeToDialectName(
    dialect
  )} using at least ONE of these words: ${selectedWords.join(', ')}.
    
    ${topicSection}
    
    Pick the words you want. You can pick just ONE or TWO if you want, don't try to make up a text with all the words. 
    Do not add any other comment, just write the text following the instructions.
    The text must grammatically correct. 
    Pay attention to proper word forms, including correct usage of cases, verb conjugations, and other grammatical features. 
    Do not use quotation marks around the text.
        
    ${languageSpecificPrompt(language)}`
}

export const generateExerciseFromFrequencyList = async (
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  position: number,
  wordLength: number,
  frequencyLists: FrequencyLists,
  topics: Topic[]
): Promise<string | null> => {
  try {
    const selectedWords = selectedWordsInWindow(frequencyLists, language, dialect, position)

    const prompt = buildPrompt(wordLength, dialect, selectedWords, language, topics)

    const response: string | null = await getLlmReplyWithFallback(
      prompt,
      GENERATE_EXERCISE_FROM_FREQUENCY_LIST_PROVIDER_CONFIG
    )
    if (response === null) {
      logWithSentry({
        message: 'getLlmReply error',
        params: {
          language,
          dialect,
          llmConfig: GENERATE_EXERCISE_FROM_FREQUENCY_LIST_PROVIDER_CONFIG,
        },
      })
    }
    return response
  } catch (error) {
    logWithSentry({
      message: 'Failed to generate exercise',
      params: {
        language,
        dialect,
        position,
        topics,
        llmConfig: GENERATE_EXERCISE_FROM_FREQUENCY_LIST_PROVIDER_CONFIG,
      },
      error: error,
    })
    return null
  }
}
