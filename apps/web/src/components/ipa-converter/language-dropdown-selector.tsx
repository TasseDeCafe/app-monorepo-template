import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@template-app/core/utils/tailwind-utils'
import { Button } from '../shadcn/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../shadcn/command.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { LangCode } from '@template-app/core/constants/lang-codes'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { langNameMessages } from '@template-app/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

type LanguageSelectorProps = {
  value: LangCode | undefined
  onLanguageSelect: (value: LangCode) => void
  langCodes: readonly LangCode[]
  placeholder?: string
  className?: string
}

export const LanguageDropdownSelector = ({
  value,
  onLanguageSelect,
  langCodes,
  placeholder,
  className,
}: LanguageSelectorProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { i18n, t } = useLingui()
  const placeholderText = placeholder ?? t`Select language`
  const languageOptions = langCodes.map((langCode: LangCode) => ({
    label: i18n._(langNameMessages[langCode]),
    value: langCode,
  }))

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className={cn(
            'w-full justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-indigo-500',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className='flex flex-row items-center gap-2'>
            {value && <CustomCircularFlag languageOrDialectCode={value} className='h-5 w-5 bg-transparent' />}
            {value ? languageOptions.find((option) => option.value === value)?.label : placeholderText}
          </div>
          <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
        <Command className='bg-white'>
          <CommandInput placeholder={t`Search language...`} className='h-9' />
          <CommandEmpty>{t`No language found.`}</CommandEmpty>
          <CommandList className='max-h-[200px]'>
            <CommandGroup>
              {languageOptions.map(({ label, value: optionValue }) => (
                <CommandItem
                  className={cn('cursor-pointer px-3 py-2 hover:bg-gray-100')}
                  value={label}
                  key={optionValue}
                  onSelect={() => {
                    onLanguageSelect(optionValue)
                    setIsPopoverOpen(false)
                  }}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <CustomCircularFlag languageOrDialectCode={optionValue} className='h-5 w-5 bg-transparent' />
                    {label}
                  </div>
                  <Check className={cn('ml-auto h-4 w-4', optionValue === value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
