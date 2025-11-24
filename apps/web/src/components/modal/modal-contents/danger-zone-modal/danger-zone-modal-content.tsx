import { useSelector } from 'react-redux'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { selectHasVoice } from '../../../../state/slices/account-slice.ts'
import { Alert, AlertDescription, AlertTitle } from '../../../shadcn/alert.tsx'
import { DeleteAccountAlertDialog } from './delete-account-alert-dialog.tsx'
import { DeleteVoiceAlertDialog } from './delete-voice-alert-dialog.tsx'
import { useLingui } from '@lingui/react/macro'

export const DangerZoneModalContent = () => {
  const { t } = useLingui()

  const hasVoice = useSelector(selectHasVoice)

  return (
    <DialogContent className='flex max-h-[90vh] w-11/12 flex-col overflow-y-auto rounded-xl bg-white shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-6'>
        <DialogTitle className='text-2xl font-bold text-stone-900'>{t`Danger Zone`}</DialogTitle>
        <DialogDescription className='hidden'></DialogDescription>
      </DialogHeader>
      <Alert variant='destructive' className='border-red-200 bg-red-50'>
        <AlertTitle className='text-lg font-medium text-red-800'>{t`Warning`}</AlertTitle>
        <AlertDescription className='text-red-600'>{t`Actions in this section can lead to permanent data loss.`}</AlertDescription>
        <div className='mt-2 space-y-2'>
          <DeleteAccountAlertDialog />
          {hasVoice && <DeleteVoiceAlertDialog />}
        </div>
      </Alert>
    </DialogContent>
  )
}
