import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { useQuery } from '@tanstack/react-query'
import { useLingui } from '@lingui/react/macro'

export const useGetSubscriptionDetails = () => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.billing.getSubscriptionDetails.queryOptions({
      queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS],
      select: (response) => response.data,
      meta: {
        errorMessage: t`Failed to fetch subscription details`,
      },
    })
  )
}
