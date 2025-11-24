import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/state/store'
import { modalActions } from '@/state/slices/modal-slice'
import { USER_FACING_ERROR_CODE } from '@/components/modal/modal-contents/something-went-wrong/types'
import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export const useCheckoutMutation = () => {
  const { t } = useLingui()
  const dispatch = useDispatch<AppDispatch>()

  return useMutation(
    orpcQuery.checkout.createCheckoutSession.mutationOptions({
      onSuccess: (response) => {
        window.location.href = response.data.url ?? ''
      },
      onError: () => {
        dispatch(modalActions.openErrorModal(USER_FACING_ERROR_CODE.CHECKOUT_ERROR))
      },
      meta: {
        errorMessage: t`Failed to create checkout session`,
        showErrorModal: false, // We are already showing an error modal in onError here.
        showErrorToast: false,
      },
    })
  )
}
