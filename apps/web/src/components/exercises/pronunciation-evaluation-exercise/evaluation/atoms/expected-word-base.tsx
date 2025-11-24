import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { areWordsEqual } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { CONFIDENCE_THRESHOLDS } from '@yourbestaccent/core/exercises/pronunciation-exercise/evaluation/score/constants'
import { WordPair } from '@yourbestaccent/core/exercises/types/evaluation-types'

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

  return (
    <>
      <div
        className={cn(
          'absolute bottom-0 left-1 right-1 h-[2px] rounded-b-xl bg-green-200 transition-colors duration-100',
          {
            'bg-green-200 group-hover:bg-green-400': actualWordMatchedExpectedWord && isExcellentPronunciation,
            'bg-yellow-200 group-hover:bg-yellow-400': actualWordMatchedExpectedWord && isMediocrePronunciation,
            'bg-orange-200 group-hover:bg-orange-400': actualWordMatchedExpectedWord && isBadPronunciation,
            'bg-red-200': actualWordHasNotMatchedExpectedWord,
            'group-hover:bg-red-300': !wordPair.actualWord && !!wordPair.expectedWord,
            'cursor-pointer group-hover:text-gray-900': !!wordPair.expectedWord,
          }
        )}
      />
      <span className='w-full px-2 text-gray-700 hover:text-gray-900 md:px-4 md:text-gray-600'>{expectedWord}</span>
    </>
  )
}
