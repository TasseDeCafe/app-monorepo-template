import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { Slider } from '@/components/slider'
import {
  MAX_EXERCISE_WORD_LENGTH,
  MIN_EXERCISE_WORD_LENGTH,
} from '@template-app/api-client/orpc-contracts/user-settings-contract'
import { useLingui } from '@lingui/react/macro'

interface LengthSetting {
  name: string
  range: [number, number]
  visualWidth: number
}

const SHORT_EXERCISE_LENGTH_UPPER_BOUND = 10
const MEDIUM_EXERCISE_LENGTH_UPPER_BOUND = 20

// Factory function to create length settings with translated names
const createLengths = (shortName: string, mediumName: string, longName: string): LengthSetting[] => [
  {
    name: shortName,
    range: [MIN_EXERCISE_WORD_LENGTH, SHORT_EXERCISE_LENGTH_UPPER_BOUND],
    visualWidth: 15,
  },
  {
    name: mediumName,
    range: [SHORT_EXERCISE_LENGTH_UPPER_BOUND + 1, MEDIUM_EXERCISE_LENGTH_UPPER_BOUND],
    visualWidth: 15,
  },
  {
    name: longName,
    range: [MEDIUM_EXERCISE_LENGTH_UPPER_BOUND + 1, MAX_EXERCISE_WORD_LENGTH],
    visualWidth: 15,
  },
]

const TOTAL_VISUAL_WIDTH = 45 // 15 + 15 + 15

const getCurrentLength = (wordCount: number, lengths: LengthSetting[]): LengthSetting => {
  const lengthSetting = lengths.find((l) => wordCount >= l.range[0] && wordCount <= l.range[1])
  return lengthSetting || lengths[Math.floor(lengths.length / 2)]
}

const wordLengthToSliderValue = (wordLength: number, lengths: LengthSetting[]): number => {
  let accumulatedWidth = 0
  for (const level of lengths) {
    if (wordLength <= level.range[1]) {
      const currentWordCountInLevel = Math.max(level.range[0], Math.min(wordLength, level.range[1]))
      const levelProgress = (currentWordCountInLevel - level.range[0]) / (level.range[1] - level.range[0] || 1)
      return accumulatedWidth + levelProgress * level.visualWidth
    }
    accumulatedWidth += level.visualWidth
  }
  return TOTAL_VISUAL_WIDTH
}

const sliderValueToWordLength = (value: number, lengths: LengthSetting[]): number => {
  let accumulatedWidth = 0
  for (const level of lengths) {
    if (value <= accumulatedWidth + level.visualWidth) {
      const levelProgress = (value - accumulatedWidth) / (level.visualWidth || 1)
      return Math.round(level.range[0] + levelProgress * (level.range[1] - level.range[0]))
    }
    accumulatedWidth += level.visualWidth
  }
  return lengths[lengths.length - 1].range[1]
}

interface ExerciseLengthSliderProps {
  initialWordCount: number
  onWordCountCommit: (newWordCount: number) => void
}

export const ExerciseLengthSlider = ({ initialWordCount, onWordCountCommit }: ExerciseLengthSliderProps) => {
  const { t } = useLingui()

  // Create length settings with translated names
  const lengths = useMemo(() => createLengths(t`Short`, t`Medium`, t`Long`), [t])

  const [currentWordCount, setCurrentWordCount] = useState(initialWordCount)
  const [sliderValue, setSliderValue] = useState(0)

  useEffect(() => {
    setCurrentWordCount(initialWordCount)
    setSliderValue(wordLengthToSliderValue(initialWordCount, lengths))
  }, [initialWordCount, lengths])

  const currentLengthSetting = getCurrentLength(currentWordCount, lengths)

  const handleSliderChange = (value: number) => {
    const newSliderVal = value
    const newWordCount = sliderValueToWordLength(newSliderVal, lengths)
    setSliderValue(newSliderVal)
    setCurrentWordCount(newWordCount)
  }

  const handleSlidingComplete = (value: number) => {
    const finalWordCount = sliderValueToWordLength(value, lengths)
    setCurrentWordCount(finalWordCount)
    setSliderValue(wordLengthToSliderValue(finalWordCount, lengths))
    onWordCountCommit(finalWordCount)
  }

  return (
    <View className='mb-4'>
      <Text className='mb-2 text-lg font-semibold text-gray-800'>{t`Exercise Length`}</Text>
      <View className='mb-4 flex-row items-center justify-between'>
        <View className='min-w-[80px] flex-row items-center justify-center rounded bg-gray-200 px-2 py-1'>
          <Text className='text-lg'>{currentLengthSetting.name}</Text>
        </View>
        <Text className='text-sm text-gray-400'>
          {t`word length:`} {currentWordCount}
        </Text>
      </View>
      <View>
        <Slider
          minimumValue={0}
          maximumValue={TOTAL_VISUAL_WIDTH}
          value={sliderValue}
          step={0.1}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor='#4f46e5'
          maximumTrackTintColor='#d1d5db'
          thumbTintColor='#4f46e5'
        />
      </View>
      <View className='relative h-5 flex-row'>
        {lengths.map((lengthItem, index) => {
          const previousLevelsWidth = lengths.slice(0, index).reduce((sum, l) => sum + l.visualWidth, 0)
          const positionPercentage = (previousLevelsWidth / TOTAL_VISUAL_WIDTH) * 100

          return (
            <Text
              key={lengthItem.name}
              className='text-base text-gray-500'
              style={{
                position: 'absolute',
                left: `${positionPercentage}%`,
              }}
            >
              {lengthItem.name}
            </Text>
          )
        })}
      </View>
    </View>
  )
}
