import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName, langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { TRANSLATE_WORD_PROVIDER_CONFIG } from '../llm-configs'

const buildTranslateWordPrompt = (
  sourceDialect: DialectCode,
  targetLang: LangCode,
  word: string,
  expectedWords: string[],
  selectedWordIndex: number
): string => {
  const contextSentence = expectedWords
    .map((word, index) => (index === selectedWordIndex ? `<${word}>` : word))
    .join(' ')

  return `Translate the following quoted ${dialectCodeToDialectName(sourceDialect)} word: '${word}' into ${langCodeToLanguageName(targetLang)}. The context of the word to translate is: '${contextSentence}'. The output should only be the translation in ${langCodeToLanguageName(targetLang)}. The word to translate is wrapped around angle brackets: <${word}>. DO NOT add any other comment, and do not add quotation marks around the translation.`
}

export const translateWord = async (
  text: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode,
  contextWords: string[],
  selectedWordIndex: number
): Promise<string | null> => {
  const prompt = buildTranslateWordPrompt(sourceDialect, targetLanguage, text, contextWords, selectedWordIndex)
  const response: string | null = await getLlmReplyWithFallback(prompt, TRANSLATE_WORD_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error',
      params: {
        sourceDialect,
        targetLanguage,
        llmConfig: TRANSLATE_WORD_PROVIDER_CONFIG,
      },
    })
  }
  return response
}
