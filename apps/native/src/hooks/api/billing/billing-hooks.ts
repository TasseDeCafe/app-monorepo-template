import { useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { SUPPORTED_STRIPE_CURRENCY } from '@yourbestaccent/core/constants/pricing-constants'
import { useLingui } from '@lingui/react/macro'

export const useGetSubscriptionDetails = (currency: SUPPORTED_STRIPE_CURRENCY, options?: { enabled?: boolean }) => {
  const { t } = useLingui()
  return useQuery(
    orpcQuery.billing.getSubscriptionDetails.queryOptions({
      input: { currency },
      meta: {
        errorMessage: t`Failed to fetch subscription details`,
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.SUBSCRIPTION_DETAILS],
      select: (response) => response.data,
      enabled: options?.enabled,
    })
  )
}
