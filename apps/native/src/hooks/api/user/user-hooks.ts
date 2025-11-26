import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { OrpcMutationOverrides } from '../hook-types'
import { useLingui } from '@lingui/react/macro'

export function useGetUser() {
  const query = useQuery(
    orpcQuery.user.getUser.queryOptions({
      queryKey: [QUERY_KEYS.USER_DATA],
      select: (response) => response.data,
    })
  )

  const userData = query.data

  const defaultedUserData = {
    referral: userData?.referral || null,
  }

  return {
    defaultedUserData,
    query,
    userData,
  }
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
