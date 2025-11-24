import React, { useState } from 'react'
import { Text, View } from 'react-native'
import { ExpectedWord } from '../atoms/expected-word'
import { ActualWord } from '../atoms/actual-word'
import { EmptySlotForExpectedWord } from '../atoms/empty-slot-for-expected-word'
import { EmptySlotForActualWord } from '../atoms/empty-slot-for-actual-word'

import {
  WordPairWithAlignment,
  WordPairWithAlignmentAndIpaAndTransliteration,
} from '@yourbestaccent/core/exercises/types/evaluation-types'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useTranslateWord } from '@/hooks/api/translation/translation-hooks'
import { useGenerateAudioWord } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useIpaTranscription } from '@/hooks/api/ipa-transcription/ipa-transcription-hooks'
import { useTransliteration } from '@/hooks/api/transliteration/transliteration-hooks'
import { CopyableIpaWord } from '../atoms/copyable-ipa-word'
import { CopyableTransliteratedWord } from '../atoms/copyable-transliterated-word'
import { NarrowSkeleton } from '../atoms/narrow-skeleton'
import * as Haptics from 'expo-haptics'
import { addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords } from '@yourbestaccent/core/utils/evaluation-utils'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { usePreferencesStore } from '@/stores/preferences-store'

import { useLingui } from '@lingui/react/macro'

type EvaluationProps = {
  wordPairsWithAlignment: WordPairWithAlignment[]
  expectedText: string
  scoreInPercentage: number
}

export const Evaluation = ({ wordPairsWithAlignment, expectedText, scoreInPercentage }: EvaluationProps) => {
  const { t } = useLingui()

  const { defaultedUserData } = useGetUser()
  const studyLanguage = defaultedUserData.studyLanguage
  const dialect = defaultedUserData.studyDialect
  const motherLanguage = defaultedUserData.motherLanguage

  const shouldShowIpa = usePreferencesStore((state) => state.shouldShowIpa)
  const shouldShowTransliteration = usePreferencesStore((state) => state.shouldShowTransliteration)

  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)

  const expectedWordsWithAlignment: WordPairWithAlignment[] = wordPairsWithAlignment.filter(
    (pair) => pair.expectedWord !== null
  )
  const contextWords: string[] = expectedWordsWithAlignment.map((pair) => pair.expectedWord as string)

  const { data: translationData } = useTranslateWord(
    selectedWord,
    dialect,
    motherLanguage,
    contextWords,
    selectedWordIndex
  )

  const { data: audioIndividualWordData } = useGenerateAudioWord(selectedWord, studyLanguage, dialect)

  const { data: ipaTranscriptionData, isFetching: isFetchingIpa } = useIpaTranscription(
    expectedText,
    studyLanguage,
    dialect
  )

  const { data: transliterationData } = useTransliteration(expectedText, studyLanguage)

  const audioIndividualWord = audioIndividualWordData?.audio || null
  const translation = translationData?.translation

  const handleTap = (text: string | null, wordIndex: number) => {
    if (text) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      setSelectedWord(text)
      setSelectedWordIndex(wordIndex)
    }
  }

  const ipaTranscriptionWords: string[] = ipaTranscriptionData?.ipaTranscription || []
  const transliterationWords: string[] = splitTextIntoWords(transliterationData?.transliteration || '', studyLanguage)
  const wordPairsWithAlignmentAndIpaAndTransliteration: WordPairWithAlignmentAndIpaAndTransliteration[] =
    addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords(
      wordPairsWithAlignment,
      ipaTranscriptionWords,
      transliterationWords
    )

  return (
    <View className='w-full items-center'>
      <Text className='mb-4 text-2xl font-bold'>
        {t`Score:`} {Math.round(scoreInPercentage)}%
      </Text>
      <View className='mb-6 w-full flex-row flex-wrap justify-center px-2'>
        {wordPairsWithAlignmentAndIpaAndTransliteration.map(
          (w: WordPairWithAlignmentAndIpaAndTransliteration, index: number) => (
            <View key={index} className='mx-1 mb-2 flex-col items-center'>
              {/* Transliteration row - only for languages with transliteration support */}
              {isLanguageWithTransliteration(studyLanguage) && !shouldShowTransliteration && <View className='h-6' />}
              {isLanguageWithTransliteration(studyLanguage) && shouldShowTransliteration && w.transliteration && (
                <CopyableTransliteratedWord text={w.transliteration} />
              )}
              {isLanguageWithTransliteration(studyLanguage) && shouldShowTransliteration && !w.transliteration && (
                <View className='h-6' />
              )}

              {/* IPA row - always render space to maintain vertical alignment */}
              {!shouldShowIpa && <View className='h-6' />}
              {shouldShowIpa && isFetchingIpa && <NarrowSkeleton />}
              {shouldShowIpa && !isFetchingIpa && w.expectedWord && w.ipa && <CopyableIpaWord text={w.ipa} />}
              {shouldShowIpa && !isFetchingIpa && (!w.expectedWord || !w.ipa) && (
                <Text className='text-center text-sm text-transparent'>{'\u200B'}</Text>
              )}

              {/* Expected word */}
              {w.expectedWord ? (
                <ExpectedWord
                  wordPairWithAlignment={w}
                  onPress={() =>
                    handleTap(
                      w.expectedWord,
                      expectedWordsWithAlignment.findIndex((pair) => pair === w)
                    )
                  }
                  translation={w.expectedWord === selectedWord ? translation : undefined}
                  audioIndividualWord={w.expectedWord === selectedWord ? audioIndividualWord : null}
                />
              ) : (
                <EmptySlotForExpectedWord />
              )}

              {/* Actual word */}
              {w.actualWord ? (
                <ActualWord pair={w} onPress={() => handleTap(w.actualWord, index)} />
              ) : (
                <EmptySlotForActualWord />
              )}
            </View>
          )
        )}
      </View>
    </View>
  )
}
