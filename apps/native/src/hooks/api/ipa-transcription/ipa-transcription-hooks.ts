import { useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'

export const useIpaTranscription = (
  text: string | null,
  studyLanguage: SupportedStudyLanguage,
  dialect: DialectCode
) => {
  return useQuery(
    orpcQuery.ipaTranscription.transcribeToIpa.queryOptions({
      input: {
        text: text!,
        language: studyLanguage,
        dialect,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.IPA_TRANSCRIPTION, text, studyLanguage, dialect],
      enabled: !!text,
      select: (response) => response.data,
    })
  )
}
