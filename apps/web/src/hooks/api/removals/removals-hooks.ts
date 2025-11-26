import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { useLingui } from '@lingui/react/macro'

export const useDeleteAccount = () => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.removals.postRemoval.mutationOptions({
      onSuccess: () => {
        window.localStorage.clear()
        window.location.replace(window.location.origin + ROUTE_PATHS.ACCOUNT_REMOVED)
      },
      meta: {
        successMessage: t`Your account has been deleted successfully.`,
        errorMessage: t`An error occurred. Please try again.`,
      },
    })
  )
}
