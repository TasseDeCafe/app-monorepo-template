import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { cn } from '@template-app/core/utils/tailwind-utils'
import { Button } from '../shadcn/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../shadcn/command.tsx'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '../shadcn/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { LangCode } from '@template-app/core/constants/lang-codes'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@template-app/i18n/lang-code-translation-utils'

type LanguageSelectProps = {
  name: string
  label: string
  description?: string
  onLanguageSelect: (value: LangCode) => void
  langCodes: readonly LangCode[]
}

export const LanguageComboBox = ({ name, label, description, onLanguageSelect, langCodes }: LanguageSelectProps) => {
  const { t, i18n } = useLingui()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const languageOptions = langCodes.map((langCode: LangCode) => ({
    label: i18n._(langNameMessages[langCode]),
    value: langCode,
  }))

  return (
    <Controller
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col items-start space-y-2'>
          <FormLabel className='text-base font-semibold'>{label}</FormLabel>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant='outline'
                  role='combobox'
                  className={cn(
                    'w-full justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-base focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <CustomCircularFlag languageOrDialectCode={field.value} className='h-5 w-5 bg-transparent' />
                    {field.value
                      ? languageOptions.find((option) => option.value === field.value)?.label
                      : t`Search language...`}
                  </div>
                  <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
              <Command className='bg-white'>
                <CommandInput placeholder={t`Search language...`} className='h-9' />
                <CommandEmpty>{t`No language found.`}</CommandEmpty>
                <CommandList className='max-h-[200px]'>
                  <CommandGroup>
                    {languageOptions.map(({ label, value }) => (
                      <CommandItem
                        className={cn('cursor-pointer px-3 py-2 hover:bg-gray-100')}
                        value={label}
                        key={value}
                        onSelect={() => {
                          field.onChange(value)
                          onLanguageSelect(value)
                          setIsPopoverOpen(false)
                        }}
                      >
                        <div className='flex flex-row items-center gap-2'>
                          <CustomCircularFlag languageOrDialectCode={value} className='h-5 w-5 bg-transparent' />
                          {label}
                        </div>
                        <Check className={cn('ml-auto h-4 w-4', value === field.value ? 'opacity-100' : 'opacity-0')} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && <FormDescription className='text-sm text-gray-400'>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
