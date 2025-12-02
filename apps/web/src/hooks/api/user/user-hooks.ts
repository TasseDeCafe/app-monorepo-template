import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'
import { useTrackingStore } from '@/stores/tracking-store'
import { useAuthStore } from '@/stores/auth-store'

export const useCreateOrUpdateUser = () => {
  const { t } = useLingui()
  const setFromBackend = useTrackingStore((state) => state.setFromBackend)
  const setUserSetupComplete = useAuthStore((state) => state.setUserSetupComplete)

  return useMutation(
    orpcQuery.user.putUser.mutationOptions({
      onSuccess: (response) => {
        const data = response.data
        const { referral, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = data

        setFromBackend({
          referral,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
        })
        setUserSetupComplete(true)
      },
      meta: {
        successMessage: t`User setup complete`,
        errorMessage: t`Error setting up user data`,
        showErrorModal: true,
      },
    })
  )
}
