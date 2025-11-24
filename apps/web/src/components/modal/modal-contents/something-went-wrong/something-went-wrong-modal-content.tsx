import { RefreshButton } from '../refresh-button.tsx'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { selectUserFacingErrorCode } from '../../../../state/slices/modal-slice.ts'
import { useSelector } from 'react-redux'
import { useLingui } from '@lingui/react/macro'

export const SomethingWentWrongModalContent = () => {
  const { t } = useLingui()

  const userFacingErrorCode = useSelector(selectUserFacingErrorCode)

  return (
    <>
      <DialogContent className='w-11/12 rounded-xl bg-white p-8 sm:max-w-md'>
        <DialogHeader className='mb-5'>
          <DialogTitle>Error</DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
        </DialogHeader>
        <p className='text-sm text-gray-500'>{t`Something went wrong. Please refresh the page and try again.`}</p>
        <p className='text-sm text-gray-500'>{t`error code: ${userFacingErrorCode}`}</p>
        <DialogFooter>
          <RefreshButton />
        </DialogFooter>
      </DialogContent>
    </>
  )
}
