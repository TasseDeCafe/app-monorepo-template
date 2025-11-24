import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useQuery } from '@tanstack/react-query'

export const useGetConfig = () => {
  return useQuery(
    orpcQuery.config.getConfig.queryOptions({
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.CONFIG],
      select: (response) => response.data,
    })
  )
}
