import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcClient, orpcQuery } from '@/transport/our-backend/orpc-client'
import {
  DEFAULT_DIALECTS,
  DialectCode,
  LangCode,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import type { GrammarPattern } from '@/components/exercises/translation-exercise/types'
import { useLingui } from '@lingui/react/macro'

export const useTranslateWord = (
  word: string,
  dialect: DialectCode,
  motherLanguage: LangCode,
  contextWords: string[],
  selectedWordIndex: number
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.translation.translateWord.queryOptions({
      input: {
        text: word,
        sourceDialect: dialect,
        targetLanguage: motherLanguage,
        contextWords,
        selectedWordIndex,
      },
      meta: {
        errorMessage: t`There was a translation error. Please try again.`,
      },
      queryKey: [QUERY_KEYS.TRANSLATE_WORD, word, motherLanguage, dialect, contextWords, selectedWordIndex],
      select: (response) => response.data,
      enabled: !!word,
      staleTime: Infinity,
    })
  )
}

export const useConversationWordTranslation = (
  word: string,
  dialect: DialectCode,
  motherLanguage: LangCode,
  contextWords: string[],
  selectedWordIndex: number,
  isPopoverOpen: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.translation.translateWord.queryOptions({
      input: {
        text: word,
        sourceDialect: dialect,
        targetLanguage: motherLanguage,
        contextWords,
        selectedWordIndex,
      },
      meta: {
        errorMessage: t`Failed to translate word, try again later`,
      },
      queryKey: [QUERY_KEYS.TRANSLATE_WORD, word, motherLanguage, dialect, contextWords, selectedWordIndex],
      select: (response) => response.data,
      enabled: isPopoverOpen && !!word,
    })
  )
}

export const useTranslateText = (
  text: string,
  dialect: DialectCode,
  motherLanguage: LangCode,
  accessToken?: string
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.translation.translateText.queryOptions({
      input: {
        text,
        sourceDialect: dialect,
        targetLanguage: motherLanguage,
      },
      meta: {
        errorMessage: t`There was a translation error. Please try again.`,
      },
      queryKey: [QUERY_KEYS.TRANSLATE_TEXT, text, motherLanguage, dialect],
      select: (response) => response.data,
      enabled: !!text && !!accessToken,
    })
  )
}

export const useTranslateWordWithTranslationContext = (
  word: string,
  dialect: DialectCode,
  targetLanguage: LangCode,
  text: string,
  translationSentence: string | undefined,
  selectedWordIndex: number,
  isSelectionMode: boolean
) => {
  return useQuery(
    orpcQuery.translation.translateWordWithTranslationContext.queryOptions({
      input: {
        word,
        sourceDialect: dialect,
        targetLanguage,
        originalSentence: text,
        translatedSentence: translationSentence!,
        wordIndex: selectedWordIndex,
      },
      queryKey: [
        QUERY_KEYS.TRANSLATE_WORD_WITH_TRANSLATION_CONTEXT,
        word,
        targetLanguage,
        dialect,
        text,
        translationSentence,
        selectedWordIndex,
      ],
      select: (response) => response.data,
      enabled: !!word && !isSelectionMode && !!translationSentence,
    })
  )
}

export const useTranslateSelection = (
  text: string,
  translationSentence: string | undefined,
  selectionChunks: string[],
  selectionPositions: number[],
  dialect: DialectCode,
  targetLanguage: LangCode
) => {
  return useQuery(
    orpcQuery.translation.translateSelection.queryOptions({
      input: {
        originalSentence: text,
        translationSentence: translationSentence!,
        selectionChunks,
        selectionPositions,
        sourceDialect: dialect,
        targetLanguage,
      },
      queryKey: [
        QUERY_KEYS.TRANSLATE_SELECTION,
        text,
        translationSentence,
        selectionChunks,
        selectionPositions,
        dialect,
        targetLanguage,
      ],
      select: (response) => response.data,
      enabled: !!translationSentence && selectionChunks.length > 0,
    })
  )
}

export const useTranslateBotMessage = (
  text: string,
  messageLanguage: SupportedStudyLanguage,
  motherLanguage: LangCode,
  translationKey: string[],
  studyLanguage: SupportedStudyLanguage
) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await orpcClient.translation.translateText({
        text,
        sourceDialect: DEFAULT_DIALECTS[messageLanguage],
        targetLanguage: motherLanguage,
      })
      return response.data
    },
    onError: (error: Error) => {
      logWithSentry('useAddWordsMutation error', error, { studyLanguage })
    },
    onSuccess: (data) => {
      queryClient.setQueryData<string>(translationKey, data.translation)
    },
    meta: {
      errorMessage: t`Failed to translate message, try again later`,
    },
  })
}
// todo orpc: we should be able to infer this from the contract
export interface TranslationExercise {
  id: string
  motherLanguageSentence: string
  studyLanguageSentence: string
  studyLanguage: SupportedStudyLanguage
  motherLanguage: LangCode
  dialect: DialectCode
  createdAt: string
  userTranslation: string | null
  skipped: boolean
  grammarPatterns?: GrammarPattern[]
}
