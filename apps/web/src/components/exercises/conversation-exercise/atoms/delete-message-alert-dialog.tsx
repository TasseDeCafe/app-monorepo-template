import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shadcn/alert-dialog'
import { Button } from '../../../design-system/button'
import { useSoftDeleteMessage } from '@/hooks/api/messages/messages-hooks'
import { useLingui } from '@lingui/react/macro'

interface DeleteMessageAlertDialogProps {
  messageId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const DeleteMessageAlertDialog = ({ messageId, isOpen, onOpenChange }: DeleteMessageAlertDialogProps) => {
  const { t } = useLingui()

  const { mutate: deleteMessage } = useSoftDeleteMessage(onOpenChange)

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t`Delete Message`}</AlertDialogTitle>
          <AlertDialogDescription>{t`Are you sure you want to delete this message? This action cannot be undone.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button>{t`Cancel`}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() =>
                deleteMessage({
                  messageId,
                })
              }
            >
              {t`Delete`}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
