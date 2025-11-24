import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { OrpcMutationOverrides } from '@/hooks/api/hook-types'
import { useLingui } from '@lingui/react/macro'

export const useUpdateMarketingPreferences = (
  options?: OrpcMutationOverrides<typeof orpcQuery.userMarketingPreferences.updateMarketingPreferences>
) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.userMarketingPreferences.updateMarketingPreferences.mutationOptions({
      ...options,
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS], response)
      },
      meta: {
        successMessage: t`Email preferences updated successfully`,
        errorMessage: t`Failed to update email preferences`,
        invalidates: [],
        ...options?.meta,
      },
    })
  )
}

export const useGetMarketingPreferences = (enabled = true) => {
  return useQuery(
    orpcQuery.userMarketingPreferences.getMarketingPreferences.queryOptions({
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS],
      enabled,
      select: (response) => response.data,
    })
  )
}
