import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { getCleanWordsFromSentence } from '@yourbestaccent/core/utils/text-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { _buildPrompt, extractIPA } from './generate-ipa-utils'
import { GENERATE_IPA_PROVIDER_CONFIG } from '../llm-configs'

export const generateIpa = async (text: string, language: LangCode, dialect: DialectCode): Promise<string[] | null> => {
  const words = getCleanWordsFromSentence(text)
  const prompt = _buildPrompt(words, language, dialect)
  const response: string | null = await getLlmReplyWithFallback(prompt, GENERATE_IPA_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error',
      params: {
        language,
        dialect,
        llmConfig: GENERATE_IPA_PROVIDER_CONFIG,
      },
    })
    return null
  }
  const ipaWords: string[] = extractIPA(response)
  if (ipaWords.length !== words.length) {
    logWithSentry({
      message: 'IPA transcription did not match the number of words in the text.',
      params: {
        text,
        language,
        dialect,
        ipaWords,
        words,
        llmConfig: GENERATE_IPA_PROVIDER_CONFIG,
      },
      isInfoLevel: true,
    })
    return []
  }
  return ipaWords
}
