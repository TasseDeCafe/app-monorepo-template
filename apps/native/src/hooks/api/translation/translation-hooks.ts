import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { DialectCode, LangCode, SupportedMotherLanguage } from '@template-app/core/constants/lang-codes'
import { useQuery } from '@tanstack/react-query'

export const useTranslateWord = (
  wordToTranslate: string | null,
  dialect: DialectCode,
  motherLanguage: SupportedMotherLanguage,
  contextWords: string[],
  selectedWordIndex: number
) => {
  return useQuery(
    orpcQuery.translation.translateWord.queryOptions({
      input: {
        text: wordToTranslate!,
        sourceDialect: dialect,
        targetLanguage: motherLanguage,
        contextWords,
        selectedWordIndex,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.TRANSLATE_WORD, wordToTranslate, motherLanguage, dialect, contextWords, selectedWordIndex],
      select: (response) => response.data,
      enabled: !!wordToTranslate,
    })
  )
}

export const useTranslateText = (
  text: string | undefined,
  sourceDialect: DialectCode | undefined,
  targetLanguage: LangCode | undefined
) => {
  return useQuery(
    orpcQuery.translation.translateText.queryOptions({
      input: {
        text: text!,
        sourceDialect: sourceDialect!,
        targetLanguage: targetLanguage!,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.TRANSLATE_TEXT, text, sourceDialect, targetLanguage],
      select: (response) => response.data,
      enabled: !!text && !!sourceDialect && !!targetLanguage,
    })
  )
}
