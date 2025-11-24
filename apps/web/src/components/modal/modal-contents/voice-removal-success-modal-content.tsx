import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../shadcn/dialog.tsx'
import { Button } from '../../shadcn/button.tsx'
import { modalActions } from '../../../state/slices/modal-slice.ts'
import { useDispatch } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const VoiceRemovalSuccessModalContent = () => {
  const dispatch = useDispatch()
  const { t } = useLingui()
  return (
    <DialogContent className='max-h-[90vh] w-11/12 overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-4'>
        <DialogTitle className='text-2xl font-bold'>{t`Voice removed`}</DialogTitle>
        <DialogDescription className='text-sm text-gray-400'>
          {t`You have successfully removed your voice. You have to recreate your voice if you want to keep using the app.`}
        </DialogDescription>
      </DialogHeader>
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
  )
}
