import { useCallback, useMemo, useState } from 'react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/dialog'
import { Button } from '../../../shadcn/button'
import { Input } from '../../../shadcn/input'
import { useDeleteAccount } from '@/hooks/api/removals/removals-hooks'
import { useModalStore } from '@/stores/modal-store'
import { useLingui } from '@lingui/react/macro'

const EXPECTED_CONFIRMATION_TEXT = 'I want to delete my account'

export const DeleteAccountModalContent = () => {
  const { t } = useLingui()
  const closeModal = useModalStore((state) => state.closeModal)
  const [confirmationText, setConfirmationText] = useState('')

  const isConfirmationValid = useMemo(() => {
    return confirmationText === EXPECTED_CONFIRMATION_TEXT
  }, [confirmationText])

  const { mutate: deleteAccount, isPending } = useDeleteAccount()

  const handleDeleteAccount = useCallback(() => {
    if (isConfirmationValid) {
      deleteAccount({ type: 'account' })
    }
  }, [deleteAccount, isConfirmationValid])

  const handleCancel = useCallback(() => {
    setConfirmationText('')
    closeModal()
  }, [closeModal])

  return (
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle className='text-center'>{t`Are you absolutely sure?`}</DialogTitle>
        <DialogDescription className='text-center'>
          {t`This action cannot be undone. This will permanently delete your account and related data from our servers.`}
        </DialogDescription>
      </DialogHeader>
      <div className='flex flex-col gap-4'>
        <div>
          <p className='mb-2 text-sm text-gray-500'>{t`Please type "${EXPECTED_CONFIRMATION_TEXT}"`}</p>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={EXPECTED_CONFIRMATION_TEXT}
            autoCapitalize='none'
            autoCorrect='off'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <Button
            onClick={handleDeleteAccount}
            variant={isConfirmationValid ? 'destructive' : 'secondary'}
            disabled={!isConfirmationValid || isPending}
          >
            {isPending ? t`Sending...` : t`Confirm deletion`}
          </Button>
          <Button variant='outline' onClick={handleCancel} disabled={isPending}>
            {t`Cancel`}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
