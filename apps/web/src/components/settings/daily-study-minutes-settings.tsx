import { useEffect, useState } from 'react'
import type { WheelEvent } from 'react'
import { Badge } from '../shadcn/badge.tsx'
import {
  DAILY_STUDY_TIME_ONBOARDING_OPTIONS,
  MAX_DAILY_STUDY_MINUTES,
  MIN_DAILY_STUDY_MINUTES,
} from '@template-app/core/constants/daily-study-constants'
import { CircleHelp } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { useLingui } from '@lingui/react/macro'

interface DailyStudyMinutesSliderProps {
  initialMinutes: number | null
  onMinutesChange: (minutes: number) => void
}

export const DailyStudyMinutesSettings = ({ initialMinutes, onMinutesChange }: DailyStudyMinutesSliderProps) => {
  const { t } = useLingui()

  const committedMinutes = initialMinutes ?? MIN_DAILY_STUDY_MINUTES
  const isPresetOptionSelected = DAILY_STUDY_TIME_ONBOARDING_OPTIONS.includes(committedMinutes)
  const [inputValue, setInputValue] = useState(isPresetOptionSelected ? '' : committedMinutes.toString())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setErrorMessage(null)
    if (isPresetOptionSelected) {
      setInputValue('')
      return
    }
    setInputValue(committedMinutes.toString())
  }, [committedMinutes, isPresetOptionSelected])

  const parsedInputValue = parseInt(inputValue, 10)
  const hasNumericInput = inputValue !== '' && !Number.isNaN(parsedInputValue)
  const displayMinutes = hasNumericInput ? parsedInputValue : committedMinutes
  const shouldShowConsistencyWarning = !errorMessage && displayMinutes > 60
  const warningMessage = shouldShowConsistencyWarning
    ? t`Consider setting this time to lower than 1hr for better daily consistency`
    : null

  const handleInputWheel = (event: WheelEvent<HTMLInputElement>) => {
    event.preventDefault()
    event.currentTarget.blur()
  }

  const handleMinutesClick = (selectedMinutes: number) => {
    setErrorMessage(null)
    setInputValue('')
    onMinutesChange(selectedMinutes)
  }

  const handleCustomInputChange = (value: string) => {
    setInputValue(value)

    if (value === '') {
      setErrorMessage(null)
      return
    }

    const numValue = parseInt(value, 10)

    if (Number.isNaN(numValue)) {
      setErrorMessage(null)
      return
    }

    if (numValue < MIN_DAILY_STUDY_MINUTES) {
      setErrorMessage(t`Daily study time must be at least ${MIN_DAILY_STUDY_MINUTES} minutes`)
      return
    }

    if (numValue > MAX_DAILY_STUDY_MINUTES) {
      setErrorMessage(t`Daily study time cannot exceed ${MAX_DAILY_STUDY_MINUTES} minutes`)
      return
    }

    setErrorMessage(null)
    onMinutesChange(numValue)
  }

  const inputClasses = [
    'h-8 rounded-lg bg-white px-3 text-sm [appearance:textfield] focus:outline-none focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    errorMessage ? 'border border-rose-500 focus:ring-rose-500' : 'border focus:ring-indigo-500',
  ].join(' ')

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-lg'>
            {displayMinutes} min
          </Badge>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-stone-400' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>
              {t`This time will be used to create daily workouts for you`}
            </PopoverContent>
          </Popover>
        </div>
        <span className='text-sm text-gray-400'>{t`${displayMinutes} minutes per day`}</span>
      </div>
      <div className='flex gap-2'>
        {DAILY_STUDY_TIME_ONBOARDING_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => handleMinutesClick(option)}
            className={`flex h-8 items-center justify-center rounded-lg border px-3 text-sm focus:outline-none ${
              committedMinutes === option && isPresetOptionSelected
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t`${option} min`}
          </button>
        ))}
      </div>
      <div className='flex w-full flex-col gap-y-1'>
        <label className='text-xs text-gray-600'>{t`Or enter a custom time:`}</label>
        <input
          autoFocus
          type='number'
          min={MIN_DAILY_STUDY_MINUTES}
          max={MAX_DAILY_STUDY_MINUTES}
          value={inputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          onWheel={handleInputWheel}
          placeholder={`${MIN_DAILY_STUDY_MINUTES}-${MAX_DAILY_STUDY_MINUTES}`}
          className={inputClasses}
        />
        <div className='mt-1 min-h-[1.75rem] space-y-1'>
          <p className={`text-xs ${errorMessage ? 'text-rose-600' : 'invisible'}`}>{errorMessage || ' '}</p>
          <p className={`text-xs text-amber-600 ${warningMessage ? '' : 'invisible'}`}>{warningMessage || ' '}</p>
        </div>
      </div>
    </div>
  )
}
