import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName, langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { TRANSLATE_TEXT_PROVIDER_CONFIG } from '../llm-configs'

const buildTranslateTextPrompt = (sourceDialect: DialectCode, targetLang: LangCode, text: string): string => {
  return `Translate the following quoted ${dialectCodeToDialectName(sourceDialect)} text: '${text}' into ${langCodeToLanguageName(targetLang)}. The output should only be the translation in ${langCodeToLanguageName(targetLang)}. DO NOT add any other comment, and do not add quotation marks around the translation.`
}

export const translateText = async (
  text: string,
  sourceDialect: DialectCode,
  targetLanguage: LangCode
): Promise<string | null> => {
  const prompt = buildTranslateTextPrompt(sourceDialect, targetLanguage, text)
  const response: string | null = await getLlmReplyWithFallback(prompt, TRANSLATE_TEXT_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error',
      params: {
        sourceDialect,
        targetLanguage,
        llmConfig: TRANSLATE_TEXT_PROVIDER_CONFIG,
      },
    })
    return null
  }
  return response
}
