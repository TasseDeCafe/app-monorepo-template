import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../../shadcn/alert-dialog.tsx'
import { Button } from '../../../shadcn/button.tsx'
import { Input } from '../../../shadcn/input.tsx'
import { useDeleteAccount } from '@/hooks/api/removals/removals-hooks'
import { useLingui } from '@lingui/react/macro'

export const DeleteAccountAlertDialog = () => {
  const { t } = useLingui()

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [confirmationText, setConfirmationText] = useState('')
  const expectedConfirmationText = t`I want to delete my account`

  const deleteMutation = useDeleteAccount()

  const handleDeleteRequest = async () => {
    deleteMutation.mutate({ type: 'account' })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <AlertDialogTrigger className='w-full rounded-md border border-red-200 bg-white px-4 py-2 text-red-500 transition-colors duration-200 hover:bg-red-600 hover:text-white'>
        {t`Delete my account`}
      </AlertDialogTrigger>
      <AlertDialogContent className='max-w-sm rounded-lg bg-white p-6 shadow-xl md:max-w-md'>
        <AlertDialogHeader className='gap-y-2'>
          <AlertDialogTitle className='text-xl font-semibold'>{t`Are you absolutely sure?`}</AlertDialogTitle>
          <AlertDialogDescription className='text-gray-500'>
            {t`This action cannot be undone. This will permanently delete your account and related data from our servers.`}
            <br />
            {`${t`Please type`} "${expectedConfirmationText}"`}
          </AlertDialogDescription>
          <Input
            value={confirmationText}
            onChange={(e) => {
              setConfirmationText(e.target.value)
            }}
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDeleteRequest}
            disabled={deleteMutation.isPending || confirmationText !== expectedConfirmationText}
            className='w-full bg-red-500 text-white hover:bg-red-600 sm:w-auto'
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t`Sending...`}
              </>
            ) : deleteMutation.isError ? (
              t`An error occurred. Please try again.`
            ) : (
              t`Confirm deletion`
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
