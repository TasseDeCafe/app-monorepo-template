import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { accountActions } from '@/state/slices/account-slice'
import { modalActions } from '@/state/slices/modal-slice'
import { VOICE_REMOVAL_SUCCESS_MODAL_ID } from '@/components/modal/modal-ids'
import { useDispatch } from 'react-redux'
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

export const useDeleteVoice = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  return useMutation(
    orpcQuery.removals.postRemoval.mutationOptions({
      onSuccess: () => {
        dispatch(accountActions.setHasNoVoice())
        dispatch(modalActions.openModal(VOICE_REMOVAL_SUCCESS_MODAL_ID))
      },
      meta: {
        successMessage: t`Your voice has been deleted successfully.`,
        errorMessage: t`An error occurred. Please try again.`,
      },
    })
  )
}
