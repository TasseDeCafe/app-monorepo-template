import { useMutation, useMutationState, useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { OrpcMutationOverrides } from '../hook-types'
import { useLingui } from '@lingui/react/macro'

export function useGetUser() {
  const query = useQuery(
    orpcQuery.user.getUser.queryOptions({
      select: (response) => response.data,
    })
  )

  return query.data
}

export function useCreateOrUpdateUser(options?: OrpcMutationOverrides<typeof orpcQuery.user.putUser>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.putUser.mutationOptions({
      meta: {
        successMessage: t`User setup complete`,
        errorMessage: t`Error setting up user data`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

// Hook to check if user setup has completed (for use in components that need to wait)
export const useIsUserSetupComplete = () => {
  const mutations = useMutationState({
    filters: { mutationKey: orpcQuery.user.putUser.key(), status: 'success' },
    select: (mutation) => mutation.state.status,
  })

  return mutations.length > 0
}
