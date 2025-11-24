import { useIsFetching, UseQueryResult } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover.tsx'
import { EvaluationProps } from './types.ts'

import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { selectShouldShowIpa, selectShouldShowTransliteration } from '@/state/slices/preferences-slice.ts'
import { ExpectedWord } from './molecules/expected-word.tsx'
import { Download } from 'lucide-react'
import { handleDownload, sanitizeTextForFileName } from '../../../audio-player/audio-player-utils.ts'
import { Score } from './score/score.tsx'
import { AddOrDeleteFromSavedWordsSection } from './atoms/add-or-delete-from-saved-words-section.tsx'
import { Separator } from '../../../design-system/separator.tsx'
import { PlayExpectedWordButton } from './atoms/play-expected-word-button.tsx'
import { ActualWord } from './atoms/actual-word.tsx'
import { EmptySlotForExpectedWord } from './atoms/empty-slot-for-expected-word.tsx'
import { EmptySlotForActualWord } from './atoms/empty-slot-for-actual-word.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { PlayActualWordButton } from './atoms/play-actual-word-button.tsx'
import { CopyableIpaWord } from '../atoms/copyable-ipa-word.tsx'
import { CopyableTranslation } from '../atoms/copyable-translation.tsx'
import { CopyableTransliteratedWord } from '../atoms/copyable-transliterated-word.tsx'
import { NarrowSkeleton } from '../atoms/narrow-skeleton.tsx'
import { GetGeneratedAudioWordData } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract.ts'
import {
  WordPairWithAlignment,
  WordPairWithAlignmentAndIpaAndTransliteration,
} from '@yourbestaccent/core/exercises/types/evaluation-types'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { useTranslateWord } from '@/hooks/api/translation/translation-hooks'
import { useGeneratedAudioIndividualWord } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useIpaTranscription } from '@/hooks/api/ipa-transcription/ipa-transcription-hooks'
import { useTransliteration } from '@/hooks/api/transliteration/transliteration-hooks'
import { addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords } from '@yourbestaccent/core/utils/evaluation-utils'
import { useLingui } from '@lingui/react/macro'

export const Evaluation = ({
  wordPairsWithAlignment,
  generatedAudioPlayerRef,
  text,
  scoreInPercentage,
  recordedAudioBlob,
}: EvaluationProps) => {
  const { t } = useLingui()

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const motherLanguage: LangCode = useSelector(selectMotherLanguageOrEnglish)
  const hasVoice: boolean = useSelector(selectHasVoice)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)

  const [textToTranslate, setTextToTranslate] = useState<string | null>(null)
  const shouldShowIpa = useSelector(selectShouldShowIpa)
  const showTransliterationPreference = useSelector(selectShouldShowTransliteration)
  const shouldShowTransliteration = showTransliterationPreference && isLanguageWithTransliteration(studyLanguage)

  const expectedWordsWithAlignment: WordPairWithAlignment[] = wordPairsWithAlignment.filter(
    (pair) => pair.expectedWord !== null
  )
  const contextWords: string[] = expectedWordsWithAlignment.map((pair) => pair.expectedWord as string)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)

  const { data: translationData } = useTranslateWord(
    textToTranslate || '',
    dialect,
    motherLanguage,
    contextWords,
    selectedWordIndex
  )

  const { data: audioIndividualWordData }: UseQueryResult<GetGeneratedAudioWordData> = useGeneratedAudioIndividualWord(
    textToTranslate,
    studyLanguage,
    dialect,
    hasVoice
  )

  const { data: ipaTranscriptionData, isFetching: isFetchingIpa } = useIpaTranscription(text, studyLanguage, dialect)

  const { data: transliterationData, isFetching: isFetchingTransliteration } = useTransliteration(text, studyLanguage)

  const audioIndividualWord: string | null = audioIndividualWordData?.audio ?? null

  const translation: string | undefined = translationData?.translation

  const handleTap = (text: string | null, wordIndex: number) => {
    if (text) {
      setTextToTranslate(text)
      setSelectedWordIndex(wordIndex)
    }
  }

  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD],
  })

  const onDownload = () => {
    POSTHOG_EVENTS.click('download_generated_word_audio')
    if (audioIndividualWord) {
      handleDownload(
        audioIndividualWord,
        `word--${sanitizeTextForFileName(textToTranslate || 'individual_word_audio')}`
      )
    }
  }

  const ipaTranscriptionWords: string[] = ipaTranscriptionData?.data.ipaTranscription || []
  const transliterationWords: string[] | undefined = splitTextIntoWords(
    transliterationData?.transliteration || '',
    studyLanguage
  )
  const wordPairsWithAlignmentAndIpaAndTransliteration: WordPairWithAlignmentAndIpaAndTransliteration[] =
    addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords(
      wordPairsWithAlignment,
      ipaTranscriptionWords,
      transliterationWords
    )
  return (
    <div className='flex w-full flex-col items-center gap-2 md:max-w-4xl md:gap-4 lg:max-w-6xl'>
      <Score scoreInPercentage={scoreInPercentage} />
      <div className='mb-4 flex flex-wrap justify-center gap-x-2 gap-y-2 px-1 md:max-w-3xl md:gap-x-3 md:gap-y-4'>
        {wordPairsWithAlignmentAndIpaAndTransliteration.map(
          (w: WordPairWithAlignmentAndIpaAndTransliteration, index: number) => (
            <div key={index} className='flex flex-col gap-y-0'>
              {/*to understand this hell have a look at:*/}
              {/*https://www.notion.so/grammarians/Tons-of-divs-for-below-and-above-the-words-21efda77261a4161b2018f6470ff7803*/}
              {isLanguageWithTransliteration(studyLanguage) && !shouldShowTransliteration && <div className='h-6' />}
              {!shouldShowIpa && <div className='h-6' />}
              {isLanguageWithTransliteration(studyLanguage) && (
                <>
                  {shouldShowTransliteration && w.transliteration && (
                    <CopyableTransliteratedWord text={w.transliteration} />
                  )}
                  {shouldShowTransliteration && !w.transliteration && <div className='h-6' />}
                  {shouldShowTransliteration && isFetchingTransliteration && <NarrowSkeleton />}
                </>
              )}
              {shouldShowIpa && w.ipa && <CopyableIpaWord text={w.ipa} />}
              {shouldShowIpa && !w.ipa && <div className='h-6' />}
              {shouldShowIpa && isFetchingIpa && <NarrowSkeleton />}
              {w.expectedWord ? (
                <Popover>
                  <PopoverTrigger>
                    <ExpectedWord
                      wordPairWithAlignment={w}
                      onClick={() =>
                        handleTap(
                          w.expectedWord,
                          expectedWordsWithAlignment.findIndex((pair) => pair === w)
                        )
                      }
                      generatedAudioPlayerRef={generatedAudioPlayerRef}
                    />
                  </PopoverTrigger>

                  <PopoverContent className='min-w-[19rem] max-w-[24rem] bg-white shadow-lg'>
                    <div className='flex flex-col items-start gap-2'>
                      <CopyableTranslation translation={translation} />
                      <Separator className='my-2' />
                      {w.actualWord && (
                        <div className='flex w-full items-center justify-between gap-2'>
                          <div className='flex items-center gap-2'>
                            <PlayActualWordButton
                              recordedAudioBlob={recordedAudioBlob}
                              startTimeInSeconds={w.actualStartTimeInSeconds}
                              endTimeInSeconds={w.actualEndTimeInSeconds}
                            />
                            <span className='whitespace-nowrap text-sm'>{t`Your pronunciation`}</span>
                          </div>
                        </div>
                      )}
                      <div className='flex w-full items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <PlayExpectedWordButton audioIndividualWord={audioIndividualWord} />
                          <span className='whitespace-nowrap text-sm'>{t`Your better pronunciation`}</span>
                        </div>
                        <button
                          onClick={onDownload}
                          disabled={!!isFetchingAudioIndividualWord}
                          className='flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-300 active:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <Download className='h-6 w-6 text-stone-700 hover:text-stone-900 active:text-stone-900' />
                        </button>
                      </div>
                      <AddOrDeleteFromSavedWordsSection
                        language={studyLanguage}
                        contextWords={contextWords}
                        wordIndex={selectedWordIndex}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <EmptySlotForExpectedWord />
              )}
              {w.actualWord ? (
                <ActualWord pair={w} onClick={() => handleTap(w.actualWord, index)} />
              ) : (
                <EmptySlotForActualWord />
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
