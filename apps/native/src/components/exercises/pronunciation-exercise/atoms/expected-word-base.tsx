import React from 'react'
import { View, Text } from 'react-native'
import { WordPair } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { areWordsEqual } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { CONFIDENCE_THRESHOLDS } from '@yourbestaccent/core/exercises/pronunciation-exercise/evaluation/score/constants'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

interface Props {
  wordPair: WordPair
}

export const BaseExpectedWord = ({ wordPair }: Props) => {
  const { expectedWord = '' } = wordPair
  const actualWordMatchedExpectedWord: boolean =
    !!wordPair.expectedWord && !!wordPair.actualWord && areWordsEqual(wordPair.expectedWord, wordPair.actualWord)
  const actualWordHasNotMatchedExpectedWord: boolean =
    (!!wordPair.expectedWord && !wordPair.actualWord) ||
    (!wordPair.expectedWord && !!wordPair.actualWord) ||
    !areWordsEqual(wordPair.expectedWord || '', wordPair.actualWord || '')
  const confidenceAsPercentage = wordPair.confidence ? wordPair.confidence * 100 : 0

  const isExcellentPronunciation = CONFIDENCE_THRESHOLDS.EXCELLENT_CONFIDENCE <= confidenceAsPercentage
  const isMediocrePronunciation =
    CONFIDENCE_THRESHOLDS.MEDIOCRE_CONFIDENCE <= confidenceAsPercentage &&
    confidenceAsPercentage < CONFIDENCE_THRESHOLDS.EXCELLENT_CONFIDENCE
  const isBadPronunciation = confidenceAsPercentage < CONFIDENCE_THRESHOLDS.MEDIOCRE_CONFIDENCE

  let barColorClass = 'bg-red-200'

  if (actualWordHasNotMatchedExpectedWord) {
    barColorClass = 'bg-red-200'
  } else if (actualWordMatchedExpectedWord) {
    if (isExcellentPronunciation) {
      barColorClass = 'bg-green-200'
    } else if (isMediocrePronunciation) {
      barColorClass = 'bg-yellow-200'
    } else if (isBadPronunciation) {
      barColorClass = 'bg-orange-200'
    }
  }

  return (
    <>
      <Text className='w-full px-2 text-gray-700'>{expectedWord}</Text>
      <View className={cn('absolute bottom-0 left-1 right-1 h-[2px] rounded-b-xl', barColorClass)} />
    </>
  )
}
