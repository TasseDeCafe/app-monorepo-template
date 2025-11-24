import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import {
  getCurrentLevel,
  Levels,
  totalVisualWidth,
  positionToSliderValue,
  sliderValueToPosition,
} from '@template-app/core/utils/cefr-level-selector-utils'
import { Slider } from '@/components/slider'
import { useLingui } from '@lingui/react/macro'

interface CefrLevelSelectorProps {
  initialPosition: number
  onPositionCommit: (newPosition: number) => void
}

export const CefrLevelSelector = ({ initialPosition, onPositionCommit }: CefrLevelSelectorProps) => {
  const { t } = useLingui()

  const [position, setPosition] = useState(initialPosition)
  const [sliderValue, setSliderValue] = useState(0)
  const currentLevel = getCurrentLevel(position)

  useEffect(() => {
    setSliderValue(positionToSliderValue(initialPosition))
    setPosition(initialPosition)
  }, [initialPosition])

  const handleSliderChange = (value: number) => {
    const newPosition = sliderValueToPosition(value)
    setSliderValue(value)
    setPosition(newPosition)
  }

  return (
    <View className='mb-4'>
      <Text className='mb-2 text-lg font-semibold text-gray-800'>{t`CEFR Level`}</Text>
      <View className='mb-4 flex-row items-center justify-between'>
        <View className='w-14 flex-row items-center justify-center rounded bg-gray-200 px-2 py-1'>
          <Text className='text-lg'>{currentLevel.name}</Text>
        </View>
        <Text className='text-sm text-gray-400'>
          {t`Position:`} {position}
        </Text>
      </View>
      <View>
        <Slider
          style={{ width: '100%' }}
          minimumValue={0}
          maximumValue={totalVisualWidth}
          value={sliderValue}
          step={0.1}
          onValueChange={handleSliderChange}
          onSlidingComplete={(value) => onPositionCommit(sliderValueToPosition(value))}
          minimumTrackTintColor='#4f46e5'
          maximumTrackTintColor='#d1d5db'
          thumbTintColor='#4f46e5'
        />
      </View>
      {/* Level labels */}
      <View className='flex-row' style={{ position: 'relative', height: 20 }}>
        {Levels.map((level, index) => {
          // Calculate label position as percentage of total width
          const previousLevelsWidth = Levels.slice(0, index).reduce((sum, l) => sum + l.visualWidth, 0)
          const positionPercentage = (previousLevelsWidth / totalVisualWidth) * 100

          return (
            <Text
              key={level.name}
              className='text-base font-medium text-gray-500'
              style={{
                position: 'absolute',
                left: `${positionPercentage}%`,
                transform: [{ translateX: index === 0 ? 0 : -10 }],
              }}
            >
              {level.name}
            </Text>
          )
        })}
      </View>
      <View className='mt-1 flex-row justify-between'>
        <Text className='text-base text-gray-500'>{t`Beginner`}</Text>
        <Text className='text-base text-gray-500'>{t`Advanced`}</Text>
      </View>
    </View>
  )
}
