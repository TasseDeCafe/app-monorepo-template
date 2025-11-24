import { Star } from 'lucide-react'
import { Button } from '../../../../design-system/button.tsx'
import { POSTHOG_EVENTS } from '../../../../../analytics/posthog/posthog-events.ts'
import { modalActions } from '../../../../../state/slices/modal-slice.ts'
import { useDispatch } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const AddOrDeleteFromSavedWordsSectionForOpenExercise = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()

  const handleSaveClick = () => {
    POSTHOG_EVENTS.click('go_to_saved_words')
    dispatch(modalActions.openSignUpPromptModal(t`Sign up to go to your "saved words"`))
  }

  const handleGoToSavedWords = () => {
    POSTHOG_EVENTS.click('add_saved_word')
    dispatch(modalActions.openSignUpPromptModal(t`Sign up to add the word to your "saved words"`))
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        onClick={handleSaveClick}
        className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 p-0'
      >
        <Star className='h-5 min-h-5 w-5 min-w-5 fill-none stroke-white' />
      </Button>
      <span onClick={handleGoToSavedWords} className='cursor-pointer text-sm underline'>
        {t`Go to saved words`}
      </span>
    </div>
  )
}
