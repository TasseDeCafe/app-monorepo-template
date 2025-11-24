import { LucideIcon, Loader2 } from 'lucide-react'
import { Button } from '../../design-system/button'
import { ShadcnTooltip } from '../../design-system/tooltip.tsx'

interface MessageActionButtonProps {
  onClick: () => void
  title: string
  Icon: LucideIcon
  isLoading?: boolean
}

export const MessageActionButton = ({ onClick, title, Icon, isLoading }: MessageActionButtonProps) => (
  <ShadcnTooltip content={title} side='top'>
    <Button
      onClick={onClick}
      className='flex h-8 w-8 items-center justify-center rounded-xl border bg-white p-0 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className='h-5 w-5 animate-spin text-gray-700' />
      ) : (
        <Icon className='h-5 w-5 text-gray-700' />
      )}
    </Button>
  </ShadcnTooltip>
)
