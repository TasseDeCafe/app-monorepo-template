import { DropdownMenuContent, DropdownMenuItem } from '../../../shadcn/dropdown'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { DeleteMessageAlertDialog } from './delete-message-alert-dialog'
import { useLingui } from '@lingui/react/macro'

interface MessageDropdownProps {
  messageId: number
}

export const MessageDropdown = ({ messageId }: MessageDropdownProps) => {
  const { t } = useLingui()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenuContent align='end' className='rounded-xl'>
        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className='cursor-pointer'>
          <Trash className='mr-2 h-4 w-4' />
          {t`Delete Message`}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <DeleteMessageAlertDialog messageId={messageId} isOpen={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
    </>
  )
}
