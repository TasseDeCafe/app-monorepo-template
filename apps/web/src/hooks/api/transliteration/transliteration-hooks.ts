import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcClient, orpcQuery } from '@/transport/our-backend/orpc-client'
import { LanguageWithTransliteration, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { isLanguageWithTransliteration } from '@template-app/core/utils/lang-codes-utils'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { useLingui } from '@lingui/react/macro'

export const useTransliteration = (text: string, studyLanguage: SupportedStudyLanguage) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.transliteration.transliterate.queryOptions({
      input: {
        text,
        language: studyLanguage as LanguageWithTransliteration,
      },
      meta: {
        errorMessage: t`There was a transliteration error. Please try again.`,
      },
      queryKey: [QUERY_KEYS.TRANSLITERATION, text, studyLanguage],
      select: (response) => response.data,
      enabled: !!text && isLanguageWithTransliteration(studyLanguage),
    })
  )
}

export const useTransliterateBotMessage = (
  text: string,
  messageLanguage: LanguageWithTransliteration,
  transliterationKey: string[],
  studyLanguage: SupportedStudyLanguage
) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await orpcClient.transliteration.transliterate({
        text,
        language: messageLanguage,
      })
      return response.data
    },
    onError: (error: Error) => {
      logWithSentry('Error generating transliteration', error, { studyLanguage })
    },
    onSuccess: (data) => {
      queryClient.setQueryData<string>(transliterationKey, data.transliteration)
    },
    meta: {
      errorMessage: t`Failed to generate transliteration, try again later`,
    },
  })
}
