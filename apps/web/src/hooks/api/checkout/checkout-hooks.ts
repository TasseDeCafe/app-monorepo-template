import { USER_FACING_ERROR_CODE } from '@/components/modal/modal-contents/something-went-wrong/types'
import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'
import { useModalStore } from '@/stores/modal-store'

export const useCheckoutMutation = () => {
  const { t } = useLingui()
  const openErrorModal = useModalStore((state) => state.openErrorModal)

  return useMutation(
    orpcQuery.checkout.createCheckoutSession.mutationOptions({
      onSuccess: (response) => {
        window.location.href = response.data.url ?? ''
      },
      onError: () => {
        openErrorModal(USER_FACING_ERROR_CODE.CHECKOUT_ERROR)
      },
      meta: {
        errorMessage: t`Failed to create checkout session`,
        showErrorModal: false, // We are already showing an error modal in onError here.
        showErrorToast: false,
      },
    })
  )
}
