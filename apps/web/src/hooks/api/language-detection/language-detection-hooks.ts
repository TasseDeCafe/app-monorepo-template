import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'

export const useDetectStudyLanguage = (text: string) => {
  return useQuery(
    orpcQuery.languageDetection.detectStudyLanguage.queryOptions({
      input: { text },
      queryKey: [QUERY_KEYS.LANGUAGE_DETECTION, text],
      select: (response) => response.data,
      enabled: !!text,
    })
  )
}
