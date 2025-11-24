import { useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { LanguageWithTransliteration, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'

export const useTransliteration = (text: string, studyLanguage: SupportedStudyLanguage) => {
  return useQuery(
    orpcQuery.transliteration.transliterate.queryOptions({
      input: {
        text,
        language: studyLanguage as LanguageWithTransliteration,
      },
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.TRANSLITERATION, text, studyLanguage],
      select: (response) => response.data,
      enabled: !!text && isLanguageWithTransliteration(studyLanguage),
    })
  )
}
