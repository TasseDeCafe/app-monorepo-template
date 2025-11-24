import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../shadcn/popover.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../../../shadcn/command.tsx'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { Button } from '../../../../../design-system/button.tsx'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

export type LanguageFilterValue = SupportedStudyLanguage | undefined

type LanguageFilterProps = {
  onLanguageSelect: (value: LanguageFilterValue) => void
  langCodes: LanguageFilterValue[]
  defaultValue?: LanguageFilterValue
}

export const LanguageFilter = ({ onLanguageSelect, langCodes, defaultValue = undefined }: LanguageFilterProps) => {
  const { t, i18n } = useLingui()
  const allLanguagesLabel = t`All languages`

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageFilterValue>(defaultValue)

  const languageOptions = langCodes.map((langCode) => ({
    label: langCode === undefined ? allLanguagesLabel : i18n._(langNameMessages[langCode]),
    value: langCode,
  }))

  const handleLanguageChange = (value: LanguageFilterValue) => {
    setSelectedLanguage(value)
    onLanguageSelect(value)
    setIsPopoverOpen(false)
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
      <PopoverTrigger asChild>
        <div className='flex flex-row items-center justify-center rounded-2xl border border-slate-200 p-1'>
          <Button
            className='flex h-10 w-full flex-row items-center justify-between rounded-xl bg-indigo-50 px-5'
            role='combobox'
          >
            <span className='flex items-center text-base font-medium leading-[19px] tracking-[-0.01em] text-indigo-800'>
              {languageOptions.find((option) => option.value === selectedLanguage)?.label || allLanguagesLabel}
            </span>
            <ChevronDown
              className={cn(
                'h-6 w-6 text-slate-700 transition-transform duration-200',
                isPopoverOpen && 'rotate-180 transform'
              )}
              strokeWidth={2}
            />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] rounded-xl p-0' align='start'>
        <Command className='rounded-xl bg-white'>
          <CommandInput placeholder={t`Search language...`} className='h-9' />
          <CommandList className='max-h-[200px]'>
            <CommandGroup>
              {languageOptions.map(({ label, value }) => (
                <CommandItem
                  className='cursor-pointer px-3 py-2 hover:bg-gray-100'
                  value={label}
                  key={value === undefined ? 'all' : value}
                  onSelect={() => handleLanguageChange(value)}
                >
                  <div className='flex flex-row items-center gap-2'>
                    {value !== undefined && (
                      <CustomCircularFlag languageOrDialectCode={value} className='h-5 w-5 bg-transparent' />
                    )}
                    {label}
                  </div>
                  <Check className={cn('ml-auto h-4 w-4', value === selectedLanguage ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
