import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { Button } from '../../../shadcn/button.tsx'
import { useDispatch, useSelector } from 'react-redux'
import { modalActions } from '../../../../state/slices/modal-slice.ts'
import { selectMotherLanguageOrEnglish } from '../../../../state/slices/account-slice.ts'
import { LangCode } from '@template-app/core/constants/lang-codes.ts'
import { useLingui } from '@lingui/react/macro'

export const AudioTooShortForCloningModal = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)

  // Thai uses spaces between phrases and sentences and not between words, so their "words" are very long
  const minimumAudioLengthInSeconds = motherLanguage === LangCode.THAI ? 5 : 20

  return (
    <>
      <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
        <DialogHeader className='mb-5'>
          <DialogTitle>{t`Hey!`}</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>
        <p className='text-sm text-gray-500'>
          {t`Your audio is too short, it has to be at least ${minimumAudioLengthInSeconds} second(s) long. Please record your voice again.`}
        </p>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatch(modalActions.closeModal())
            }}
            type='submit'
            className='bg-gray-200 shadow hover:bg-gray-300 md:w-1/3'
          >
            {t`Close`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  )
}
