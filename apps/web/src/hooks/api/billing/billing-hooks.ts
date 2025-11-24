import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { SUPPORTED_STRIPE_CURRENCY } from '@template-app/core/constants/pricing-constants'
import { useQuery } from '@tanstack/react-query'
import { useLingui } from '@lingui/react/macro'

export const useGetSubscriptionDetails = (currency: SUPPORTED_STRIPE_CURRENCY) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.billing.getSubscriptionDetails.queryOptions({
      input: { currency },
      queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS],
      select: (response) => response.data,
      meta: {
        errorMessage: t`Failed to fetch subscription details`,
      },
    })
  )
}
