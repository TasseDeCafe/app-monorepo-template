import { useState } from 'react'
import { Check, ChevronDown, Calendar, Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Command, CommandGroup, CommandItem, CommandList } from '../shadcn/command.tsx'
import { Button } from '../design-system/button.tsx'
import { TimePeriodKey } from '@yourbestaccent/api-client/orpc-contracts/leaderboard-contract'
import { useLingui } from '@lingui/react/macro'

export type TimePeriodFilterValue = TimePeriodKey

type TimePeriodFilterProps = {
  onTimePeriodSelect: (value: TimePeriodFilterValue) => void
  defaultValue?: TimePeriodFilterValue
}

export const TimePeriodFilter = ({ onTimePeriodSelect, defaultValue = 'allTime' }: TimePeriodFilterProps) => {
  const { t } = useLingui()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodFilterValue>(defaultValue)

  const timePeriodOptions: Array<{
    label: string
    value: TimePeriodFilterValue
    icon: typeof Calendar
  }> = [
    {
      label: t`All Time`,
      value: 'allTime',
      icon: Calendar,
    },
    {
      label: t`This Week`,
      value: 'weekly',
      icon: Clock,
    },
  ]

  const handleTimePeriodChange = (value: TimePeriodFilterValue) => {
    setSelectedTimePeriod(value)
    onTimePeriodSelect(value)
    setIsPopoverOpen(false)
  }

  const selectedOption = timePeriodOptions.find((option) => option.value === selectedTimePeriod)

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
      <PopoverTrigger asChild>
        <div className='flex flex-row items-center justify-center rounded-2xl border border-slate-200 p-1'>
          <Button
            className='flex h-10 w-full flex-row items-center justify-between rounded-xl bg-indigo-50 px-5'
            role='combobox'
          >
            <span className='flex items-center gap-2 text-base font-medium leading-[19px] tracking-[-0.01em] text-indigo-800'>
              {selectedOption && <selectedOption.icon className='h-4 w-4' />}
              {selectedOption?.label}
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
          <CommandList className='max-h-[200px]'>
            <CommandGroup>
              {timePeriodOptions.map(({ label, value, icon: Icon }) => (
                <CommandItem
                  className='cursor-pointer px-3 py-2 hover:bg-gray-100'
                  value={label}
                  key={value}
                  onSelect={() => handleTimePeriodChange(value)}
                >
                  <div className='flex flex-row items-center gap-2'>
                    <Icon className='h-4 w-4 text-slate-600' />
                    {label}
                  </div>
                  <Check
                    className={cn('ml-auto h-4 w-4', value === selectedTimePeriod ? 'opacity-100' : 'opacity-0')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
