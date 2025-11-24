import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { Button } from '../../../shadcn/button.tsx'
import { useDispatch } from 'react-redux'
import { modalActions } from '@/state/slices/modal-slice'
import { MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS } from '@yourbestaccent/core/constants/pronunciation-evaluation-exercise-constants'
import { useLingui } from '@lingui/react/macro'

export const AudioTooShortForPronunciationModal = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()

  return (
    <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
      <DialogHeader className='mb-5'>
        <DialogTitle>{t`Hey!`}</DialogTitle>
        <DialogDescription className='hidden'></DialogDescription>
      </DialogHeader>
      <p className='text-sm text-gray-500'>
        {t`Your audio is too short, it has to be at least ${MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS} second(s) long. Please record your voice again.`}
      </p>
      <DialogFooter>
        <Button
          onClick={() => {
            dispatch(modalActions.closeModal())
          }}
          type='button'
          className='bg-gray-200 shadow hover:bg-gray-300 md:w-1/3'
        >
          {t`Close`}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
