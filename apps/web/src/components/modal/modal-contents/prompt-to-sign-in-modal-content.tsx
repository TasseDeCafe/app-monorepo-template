import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shadcn/dialog.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useDispatch, useSelector } from 'react-redux'
import { modalActions, selectSignUpPromptText } from '@/state/slices/modal-slice.ts'
import { Button } from '../../design-system/button.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useLingui } from '@lingui/react/macro'

export const PromptToSignInModalContent = () => {
  const { t } = useLingui()

  const signUpPromptText = useSelector(selectSignUpPromptText)
  const dispatch = useDispatch()

  const handleClick = (isSignUp: boolean) => {
    POSTHOG_EVENTS.click(isSignUp ? 'go_to_sign_up_button' : 'go_to_sign_in_button')
    const path = isSignUp ? ROUTE_PATHS.SIGN_UP : ROUTE_PATHS.SIGN_IN
    const url = new URL(path, window.location.origin)
    window.open(url.toString(), '_blank')
    dispatch(modalActions.closeModal())
  }

  return (
    <DialogContent className='max-h-[90vh] w-11/12 rounded-xl bg-white p-6 shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-4'>
        <DialogTitle className='text-2xl font-bold'>{t`Master your pronunciation`}</DialogTitle>
        <DialogDescription className='text-lg'>{signUpPromptText}</DialogDescription>
      </DialogHeader>
      <div className='flex flex-col gap-4'>
        <Button onClick={() => handleClick(true)} className='w-full rounded-xl bg-indigo-600 px-4 py-2 text-white'>
          {t`Sign up`}
        </Button>
        <Button onClick={() => handleClick(false)} className='w-full rounded-xl border px-4 py-2'>
          {t`Sign in`}
        </Button>
      </div>
    </DialogContent>
  )
}
