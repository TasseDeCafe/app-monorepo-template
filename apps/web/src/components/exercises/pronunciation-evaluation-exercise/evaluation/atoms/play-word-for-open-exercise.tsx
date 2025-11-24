import { Button } from '../../../../design-system/button.tsx'
import { Play } from 'lucide-react'
import { POSTHOG_EVENTS } from '../../../../../analytics/posthog/posthog-events.ts'
import { modalActions } from '../../../../../state/slices/modal-slice.ts'
import { useDispatch } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const PlayWordForOpenExercise = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const onPlay = () => {
    POSTHOG_EVENTS.click('play_pronunciation')
    dispatch(
      modalActions.openSignUpPromptModal(
        t`Sign up to listen to the correct pronunciation generated with your voice clone`
      )
    )
  }

  return (
    <div className='flex items-center'>
      <div className='relative h-10 w-10'>
        <Button className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 p-0' onClick={onPlay}>
          <Play className='h-5 min-h-5 w-5 min-w-5 text-white' />
        </Button>
      </div>
    </div>
  )
}
