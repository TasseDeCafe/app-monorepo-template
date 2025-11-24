import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/popover.tsx'
import { CircleHelp } from 'lucide-react'
import { Toggle } from '../../../../design-system/toggle.tsx'
import { useLingui } from '@lingui/react/macro'

export const IpaToggle = ({
  shouldShowIpa,
  handleIpaClick,
}: {
  shouldShowIpa: boolean
  handleIpaClick: () => void
}) => {
  const { t } = useLingui()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-2'>
        <span className='text-sm font-medium text-gray-700'>{t`IPA`}</span>
        <Popover>
          <PopoverTrigger>
            <CircleHelp className='h-4 w-4 text-gray-400' />
          </PopoverTrigger>
          <PopoverContent className='w-64 bg-white text-sm'>{t`IPA (International Phonetic Alphabet) transcription is an experimental feature and might contain errors.`}</PopoverContent>
        </Popover>
      </div>
      <Toggle isToggled={shouldShowIpa} onClick={handleIpaClick} size='lg' />
    </div>
  )
}
