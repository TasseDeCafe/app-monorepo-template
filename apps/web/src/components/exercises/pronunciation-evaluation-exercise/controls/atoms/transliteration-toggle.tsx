import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/popover.tsx'
import { CircleHelp } from 'lucide-react'
import { Toggle } from '../../../../design-system/toggle.tsx'
import { useLingui } from '@lingui/react/macro'

export const TransliterationToggle = ({
  shouldShowTransliteration,
  handleTransliterationClick,
}: {
  shouldShowTransliteration: boolean
  handleTransliterationClick: () => void
}) => {
  const { t } = useLingui()

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-2'>
        <span className='text-sm font-medium text-gray-700'>{t`Transliteration`}</span>
        <Popover>
          <PopoverTrigger>
            <CircleHelp className='h-4 w-4 text-gray-400' />
          </PopoverTrigger>
          <PopoverContent className='w-64 bg-white text-sm'>
            {t`We provide transliteration for languages that use non-Latin scripts.`}
          </PopoverContent>
        </Popover>
      </div>
      <Toggle isToggled={shouldShowTransliteration} onClick={handleTransliterationClick} size='lg' />
    </div>
  )
}
