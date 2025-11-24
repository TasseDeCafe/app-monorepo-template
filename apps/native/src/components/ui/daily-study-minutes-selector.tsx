import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { DailyStudyTimeCard } from './daily-study-time-card'
import {
  DAILY_STUDY_TIME_ONBOARDING_OPTIONS,
  MAX_DAILY_STUDY_MINUTES,
  MIN_DAILY_STUDY_MINUTES,
} from '@yourbestaccent/core/constants/daily-study-constants'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

interface DailyStudyMinutesSelectorProps {
  initialMinutes: number | null
  onMinutesChange: (minutes: number) => void
}

export const DailyStudyMinutesSelector: React.FC<DailyStudyMinutesSelectorProps> = ({
  initialMinutes,
  onMinutesChange,
}) => {
  const { t } = useLingui()

  const [minutes, setMinutes] = useState(initialMinutes || MIN_DAILY_STUDY_MINUTES)
  const [customMinutes, setCustomMinutes] = useState<string>('')
  const [isCustomSelected, setIsCustomSelected] = useState(false)

  useEffect(() => {
    const newMinutes: number = initialMinutes || MIN_DAILY_STUDY_MINUTES
    setMinutes(newMinutes)

    const isPresetOption = DAILY_STUDY_TIME_ONBOARDING_OPTIONS.includes(newMinutes)
    if (!isPresetOption) {
      setIsCustomSelected(true)
      setCustomMinutes(newMinutes.toString())
    } else {
      setIsCustomSelected(false)
      setCustomMinutes('')
    }
  }, [initialMinutes])

  const handleMinutesClick = (selectedMinutes: number) => {
    setMinutes(selectedMinutes)
    setIsCustomSelected(false)
    setCustomMinutes('')
    onMinutesChange(selectedMinutes)
  }

  const handleCustomInputChange = (value: string) => {
    setCustomMinutes(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= MIN_DAILY_STUDY_MINUTES && numValue <= MAX_DAILY_STUDY_MINUTES) {
      setMinutes(numValue)
      setIsCustomSelected(true)
      onMinutesChange(numValue)
    }
  }

  return (
    <View className='gap-4'>
      {/* Current Value Display */}
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center gap-2'>
          <View className='rounded-full bg-indigo-100 px-3 py-1'>
            <Text className='text-lg font-medium text-indigo-700'>{minutes} min</Text>
          </View>
        </View>
        <Text className='text-sm text-gray-400'>{t`${minutes} minutes per day`}</Text>
      </View>
      {/* Preset Options */}
      <View className='gap-2'>
        {DAILY_STUDY_TIME_ONBOARDING_OPTIONS.map((option) => (
          <DailyStudyTimeCard
            key={option}
            minutes={option}
            handleClick={() => handleMinutesClick(option)}
            isSelected={minutes === option && !isCustomSelected}
          />
        ))}
      </View>
      {/* Custom Input */}
      <View className='gap-1'>
        <Text className='text-xs text-gray-600'>{t`Or enter a custom time:`}</Text>
        <BottomSheetTextInput
          className='h-12 rounded-xl border border-gray-200 bg-white px-3 text-base'
          value={customMinutes}
          onChangeText={handleCustomInputChange}
          placeholder={`${MIN_DAILY_STUDY_MINUTES}-${MAX_DAILY_STUDY_MINUTES}`}
          placeholderTextColor={colors.gray[500]}
          keyboardType='numeric'
          returnKeyType='done'
        />
        {minutes > 60 && (
          <Text className='mt-1 text-xs text-amber-600'>{t`Consider setting this time to lower than 1hr for better daily consistency`}</Text>
        )}
      </View>
    </View>
  )
}
