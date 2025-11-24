import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName, langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { TRANSLATE_WORD_PROVIDER_CONFIG } from '../llm-configs'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'

const dialectCodeToLangCode = (dialectCode: DialectCode): LangCode => {
  return dialectCode.split('-')[0] as LangCode
}

const buildTranslateWordWithTranslationContextPrompt = (
  sourceDialect: DialectCode,
  targetLang: LangCode,
  word: string,
  originalSentence: string,
  translatedSentence: string,
  wordIndex: number
): string => {
  const sourceLangCode = dialectCodeToLangCode(sourceDialect)
  const originalWords = splitTextIntoWords(originalSentence, sourceLangCode)
  const contextSentence = originalWords.map((w, index) => (index === wordIndex ? `<${w}>` : w)).join(' ')

  return `Translate the following quoted ${dialectCodeToDialectName(sourceDialect)} word: '${word}' into ${langCodeToLanguageName(targetLang)}.

Context:
- Original sentence: '${contextSentence}'
- Full translated sentence: '${translatedSentence}'

The word to translate is wrapped in angle brackets: <${word}>. Use the translated sentence as reference to provide a translation that is consistent with the overall translation context.

The output should only be the translation in ${langCodeToLanguageName(targetLang)}. DO NOT add any other comment, and do not add quotation marks around the translation.`
}

export const translateWordWithTranslationContext = async (
  word: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode,
  originalSentence: string,
  translatedSentence: string,
  wordIndex: number
): Promise<string | null> => {
  const prompt = buildTranslateWordWithTranslationContextPrompt(
    sourceDialect,
    targetLanguage,
    word,
    originalSentence,
    translatedSentence,
    wordIndex
  )
  const response: string | null = await getLlmReplyWithFallback(prompt, TRANSLATE_WORD_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error',
      params: {
        sourceDialect,
        targetLanguage,
        word,
        originalSentence,
        translatedSentence,
        wordIndex,
        llmConfig: TRANSLATE_WORD_PROVIDER_CONFIG,
      },
    })
  }
  return response
}
