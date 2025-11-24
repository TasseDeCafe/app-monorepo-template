import { useMutation } from '@tanstack/react-query'
import { localStorageWrapper } from '@/local-storage/local-storage-wrapper'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { DialectCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { toast } from 'sonner'
import { orpcOpenClient } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

interface TranscribeTextParams {
  text: string
  language: SupportedStudyLanguage
  dialect: DialectCode
}

export const useTranscribeTextForConverter = (isSignedIn: boolean, setOutputIpa: (ipa: string) => void) => {
  const { t } = useLingui()

  return useMutation({
    mutationFn: async ({ text, language, dialect }: TranscribeTextParams) => {
      const response = await orpcOpenClient.ipaTranscription.transcribeToIpa({
        text,
        language,
        dialect,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.ipaTranscription && data.ipaTranscription.length > 0) {
        setOutputIpa(data.ipaTranscription.join(' '))
        if (!isSignedIn) {
          localStorageWrapper.incrementIpaTranscriptionCount()
        }
      } else {
        setOutputIpa('')
        toast.error(t`No transcription available for this text`)
      }
    },
    onError: (error, variables) => {
      logWithSentry('IPA transcription failed', error, {
        language: variables.language,
        dialect: variables.dialect,
        textLength: variables.text.length,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
    },
    meta: {
      errorMessage: t`Failed to transcribe text. Please try again.`,
    },
  })
}
