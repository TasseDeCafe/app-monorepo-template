import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useDispatch } from 'react-redux'
import { accountActions } from '@/state/slices/account-slice'
import { useLingui } from '@lingui/react/macro'

export const useCreateOrUpdateUser = () => {
  const { t } = useLingui()
  const dispatch = useDispatch()

  return useMutation(
    orpcQuery.user.putUser.mutationOptions({
      onSuccess: (response) => {
        const data = response.data
        const { referral, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = data

        dispatch(
          accountActions.setBackendUserInfo({
            referral,
            utmSource: utmSource,
            utmMedium: utmMedium,
            utmCampaign: utmCampaign,
            utmTerm: utmTerm,
            utmContent: utmContent,
          })
        )
      },
      meta: {
        successMessage: t`User setup complete`,
        errorMessage: t`Error setting up user data`,
        showErrorModal: true,
      },
    })
  )
}
