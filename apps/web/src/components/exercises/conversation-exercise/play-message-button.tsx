import { Play, Volume2, Loader2 } from 'lucide-react'
import { Button } from '../../design-system/button'
import { ShadcnTooltip } from '../../design-system/tooltip'
import { useLingui } from '@lingui/react/macro'

interface PlayMessageButtonProps {
  onClick: () => void
  isLoading: boolean
  isPlaying: boolean
}

export const PlayMessageButton = ({ onClick, isLoading, isPlaying }: PlayMessageButtonProps) => {
  const { t } = useLingui()

  const tooltipContent = isPlaying ? t`Playing audio` : t`Play audio`

  return (
    <ShadcnTooltip content={tooltipContent} side='top'>
      <Button
        onClick={onClick}
        className='flex h-8 w-8 items-center justify-center rounded-xl border bg-white p-0 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
        title={tooltipContent}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className='h-5 w-5 animate-spin text-gray-700' />
        ) : isPlaying ? (
          <Volume2 className='h-5 w-5 text-gray-700' />
        ) : (
          <Play className='h-5 w-5 text-gray-700' />
        )}
      </Button>
    </ShadcnTooltip>
  )
}
