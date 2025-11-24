import React, { useEffect, useState } from 'react'
import { Badge } from '../../../../../shadcn/badge.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../shadcn/popover.tsx'
import { CircleHelp } from 'lucide-react'
import { Slider } from '../../../../../shadcn/slider.tsx'
import {
  getCurrentLevel,
  Levels,
  totalVisualWidth,
  positionToSliderValue,
  sliderValueToPosition,
} from '@yourbestaccent/core/utils/cefr-level-selector-utils.ts'
import { useLingui } from '@lingui/react/macro'

interface CEFRScaleProps {
  initialPosition: number
  onPositionCommit: (newPosition: number) => void
}

export const CefrLevelSelector: React.FC<CEFRScaleProps> = ({ initialPosition, onPositionCommit }) => {
  const { t } = useLingui()

  const [position, setPosition] = useState(initialPosition)
  const [sliderValue, setSliderValue] = useState(0)

  const currentLevel = getCurrentLevel(position)

  useEffect(() => {
    setSliderValue(positionToSliderValue(initialPosition))
    setPosition(initialPosition)
  }, [initialPosition])

  const handleSliderChange = (newValue: number[]) => {
    const newPosition = sliderValueToPosition(newValue[0])
    setSliderValue(newValue[0])
    setPosition(newPosition)
  }

  const handleSliderCommit = (newValue: number[]) => {
    const newPosition = sliderValueToPosition(newValue[0])
    onPositionCommit(newPosition)
  }

  return (
    <div className='mb-4 space-y-3'>
      <h3 className='text-base font-semibold text-gray-800'>{t`CEFR Level`}</h3>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-lg'>
            {currentLevel.name}
          </Badge>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-stone-400' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>
              {t`The Common European Framework of Reference (CEFR) defines language proficiency across six levels: A1 and A2 (Basic User), B1 and B2 (Independent User), C1 and C2 (Proficient User). Each level represents increasing language ability, from beginner to near-native fluency. These standardized levels help learners, teachers, and employers understand and compare language skills internationally.`}
            </PopoverContent>
          </Popover>
        </div>
        <div className='flex justify-center gap-2'>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-stone-400' />
            </PopoverTrigger>
            <PopoverContent className='bg-white text-center text-sm shadow-lg'>
              {t`We will generate sentences with words at around this position in the frequency list. A frequency list shows which words are used most often in a language. The lower the position of the word in a frequency list the more often it appears in the language. Words at a higher position are less frequent which very often means they are more difficult to learn.`}
            </PopoverContent>
          </Popover>
          <span className='text-sm text-gray-400'>
            {t`Position:`} {position}
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
          {Levels.map((level) => (
            <div
              key={level.name}
              className='text-xs font-medium text-gray-500'
              style={{ width: `${(level.visualWidth / totalVisualWidth) * 100}%` }}
            >
              {level.name}
            </div>
          ))}
        </div>
        <div className='flex justify-between text-sm text-gray-500'>
          <span>{t`Beginner`}</span>
          <span>{t`Advanced`}</span>
        </div>
      </div>
    </div>
  )
}
