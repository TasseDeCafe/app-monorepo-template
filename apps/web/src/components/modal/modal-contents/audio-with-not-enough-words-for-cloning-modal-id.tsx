import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../shadcn/dialog.tsx'
import { Button } from '../../shadcn/button.tsx'
import { useDispatch } from 'react-redux'
import { modalActions } from '../../../state/slices/modal-slice.ts'
import { useLingui } from '@lingui/react/macro'

export const AudioWithNotEnoughWordsForCloningModalId = () => {
  const dispatch = useDispatch()
  const { t } = useLingui()
  return (
    <>
      <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
        <DialogHeader className='mb-5'>
          <DialogTitle>{t`Hey!`}</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>
        <p className='text-sm text-gray-500'>{t`Your audio has not enough words, make sure you read the provided text.`}</p>
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
