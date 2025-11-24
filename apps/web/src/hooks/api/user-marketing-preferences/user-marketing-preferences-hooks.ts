import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { MutationMeta } from '@/hooks/api/hook-types'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export const useUpdateMarketingEmailPreferences = (metaOptions?: MutationMeta) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.userMarketingPreferences.updateMarketingPreferences.mutationOptions({
      onMutate: async (newValue) => {
        await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS] })
        const previousValue = queryClient.getQueryData<{ data: { shouldReceiveMarketingEmails: boolean } }>([
          QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS,
        ])

        queryClient.setQueryData([QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS], {
          data: {
            shouldReceiveMarketingEmails: newValue.shouldReceiveMarketingEmails,
          },
        })

        return { previousValue }
      },
      onError: (_, _newValue, context) => {
        if (context?.previousValue !== undefined) {
          queryClient.setQueryData([QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS], context.previousValue)
        }
      },
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS], response)
      },
      meta: {
        errorMessage: t`Failed to update email preferences`,
        successMessage: t`Email preferences updated successfully`,
        ...metaOptions,
      },
    })
  )
}
export const useShouldReceiveMarketingEmails = (enabled = true) => {
  const { t } = useLingui()

  const { data } = useQuery(
    orpcQuery.userMarketingPreferences.getMarketingPreferences.queryOptions({
      queryKey: [QUERY_KEYS.SHOULD_RECEIVE_MARKETING_EMAILS],
      enabled,
      select: (response) => response.data.shouldReceiveMarketingEmails,
      meta: {
        errorMessage: t`Failed to fetch marketing preferences`,
      },
    })
  )

  return data ?? false
}
