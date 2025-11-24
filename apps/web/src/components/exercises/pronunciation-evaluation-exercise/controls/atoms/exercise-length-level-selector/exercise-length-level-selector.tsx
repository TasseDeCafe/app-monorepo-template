import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../../../shadcn/badge.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../shadcn/popover.tsx'
import { CircleHelp } from 'lucide-react'
import { Slider } from '../../../../../shadcn/slider.tsx'
import { createLengths, getCurrentLength } from './exercise-length-level-selector-utils.ts'
import { useLingui } from '@lingui/react/macro'

interface WordLengthProps {
  initialWordLength: number
  onWordLengthCommit: (wordLength: number) => void
}

export const ExerciseLengthLevelSelector = ({ initialWordLength, onWordLengthCommit }: WordLengthProps) => {
  const { t } = useLingui()

  const Lengths = useMemo(() => createLengths(t`Short`, t`Medium`, t`Long`), [t])
  const totalVisualWidth = useMemo(() => Lengths.reduce((sum, level) => sum + level.visualWidth, 0), [Lengths])

  const [wordLength, setWordLength] = useState(initialWordLength)
  const [sliderValue, setSliderValue] = useState(0)

  const currentLevel = getCurrentLength(wordLength, Lengths)

  const wordLengthToSliderValue = (wordLength: number): number => {
    let accumulatedWidth = 0
    for (const level of Lengths) {
      if (wordLength <= level.range[1]) {
        const levelProgress = (wordLength - level.range[0]) / (level.range[1] - level.range[0])
        return accumulatedWidth + levelProgress * level.visualWidth
      }
      accumulatedWidth += level.visualWidth
    }
    return totalVisualWidth
  }

  const sliderValueToWordLength = (value: number): number => {
    let accumulatedWidth = 0
    for (const level of Lengths) {
      if (value <= accumulatedWidth + level.visualWidth) {
        const levelProgress = (value - accumulatedWidth) / level.visualWidth
        return Math.round(level.range[0] + levelProgress * (level.range[1] - level.range[0]))
      }
      accumulatedWidth += level.visualWidth
    }
    return Lengths[Lengths.length - 1].range[1] // Return max wordLength if slider is at the end
  }

  useEffect(() => {
    setSliderValue(wordLengthToSliderValue(initialWordLength))
    setWordLength(initialWordLength)
  }, [initialWordLength])

  const handleSliderChange = (newValue: number[]) => {
    const newPosition = sliderValueToWordLength(newValue[0])
    setSliderValue(newValue[0])
    setWordLength(newPosition)
  }

  const handleSliderCommit = (newValue: number[]) => {
    const newPosition = sliderValueToWordLength(newValue[0])
    onWordLengthCommit(newPosition)
  }

  return (
    <div className='mb-4 space-y-3'>
      <h3 className='text-base font-semibold text-gray-800'>{t`Exercise Length`}</h3>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-lg'>
            {currentLevel.name}
          </Badge>
        </div>
        <div className='flex justify-center gap-2'>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-stone-400' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>
              {t`The length of the actual exercise might differ slightly from length you requested.`}
            </PopoverContent>
          </Popover>
          <span className='text-sm text-gray-400'>
            {t`word length:`} {wordLength}
          </span>
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <Slider
          value={[sliderValue]}
          min={0}
          max={totalVisualWidth}
          step={0.1}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className='w-full'
        />
        <div className='flex justify-between'>
          {Lengths.map((level) => (
            <div
              key={level.name}
              className='text-xs font-medium text-gray-500'
              style={{ width: `${(level.visualWidth / totalVisualWidth) * 100}%` }}
            >
              {level.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
