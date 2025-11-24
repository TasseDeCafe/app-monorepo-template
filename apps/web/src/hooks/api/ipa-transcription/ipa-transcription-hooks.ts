import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { useLingui } from '@lingui/react/macro'

export const useIpaTranscription = (text: string, studyLanguage: SupportedStudyLanguage, dialect: DialectCode) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.ipaTranscription.transcribeToIpa.queryOptions({
      queryKey: [QUERY_KEYS.IPA_TRANSCRIPTION, text, studyLanguage, dialect],
      input: text ? { text, language: studyLanguage, dialect } : skipToken,
      meta: {
        errorMessage: t`Failed to generate IPA transcription, try again later`,
      },
    })
  )
}

export const useGenerateIpaForBotMessage = (ipaTranscriptionKey: string[], studyLanguage: SupportedStudyLanguage) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.ipaTranscription.transcribeToIpa.mutationOptions({
      onError: (error, variables) => {
        logWithSentry('Error generating IPA transcription', error, {
          studyLanguage,
          messageLanguage: variables.language,
        })
      },
      onSuccess: (response) => {
        queryClient.setQueryData(ipaTranscriptionKey, response.data.ipaTranscription)
      },
      meta: {
        errorMessage: t`Failed to generate IPA transcription, try again later`,
      },
    })
  )
}
