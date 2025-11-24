import { useCallback, useState } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice'
import { CopyableTranslation } from '@/components/exercises/pronunciation-evaluation-exercise/atoms/copyable-translation'
import { PlayExpectedWordButton } from '@/components/exercises/pronunciation-evaluation-exercise/evaluation/atoms/play-expected-word-button'
import { Separator } from '@/components/design-system/separator'
import {
  DialectCode,
  LangCode,
  SupportedMotherLanguage,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { Download } from 'lucide-react'
import { handleDownload, sanitizeTextForFileName } from '@/components/audio-player/audio-player-utils'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { SelectableWord } from '@/components/design-system/selectable-word'
import {
  useTranslateSelection,
  useTranslateWordWithTranslationContext,
} from '@/hooks/api/translation/translation-hooks'
import { useLingui } from '@lingui/react/macro'
import { useGeneratedAudioIndividualWord } from '@/hooks/api/audio-generation/audio-generation-hooks'

interface SelectableTextProps {
  text: string
  isSelectionMode?: boolean
  language?: LangCode
  targetLanguage?: LangCode
  translationSentence?: string
  onSelection?: (chunk: string[], positions: number[], language: string) => void
  onExitSelectionMode?: () => void
}

export const SelectableText = ({
  text,
  isSelectionMode = false,
  language = LangCode.ENGLISH,
  targetLanguage,
  translationSentence,
  onSelection,
  onExitSelectionMode,
}: SelectableTextProps) => {
  const { t } = useLingui()

  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set())
  const [wordToTranslate, setWordToTranslate] = useState<string>('')
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)
  const [dropdownWordIndex, setDropdownWordIndex] = useState<number | null>(null)
  const [selectionTranslationData, setSelectionTranslationData] = useState<{
    chunks: string[]
    positions: number[]
    language: string
    translation: string
    lastSelectedWordIndex: number
  } | null>(null)

  const motherLanguage: SupportedMotherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const hasVoice: boolean = useSelector(selectHasVoice)

  const words = splitTextIntoWords(text, language)

  const { data: translationData } = useTranslateWordWithTranslationContext(
    wordToTranslate,
    dialect,
    targetLanguage || motherLanguage,
    text,
    translationSentence,
    selectedWordIndex,
    isSelectionMode
  )

  // Determine the word to generate audio for and the language
  // If we're showing the study language sentence, use the clicked word directly
  // If we're showing the mother language sentence, use the translation
  const audioWord = language === studyLanguage ? wordToTranslate : translationData?.translation

  const { data: audioIndividualWordData } = useGeneratedAudioIndividualWord(
    audioWord,
    studyLanguage,
    dialect,
    hasVoice,
    isSelectionMode
  )

  const { data: selectionTranslationDataQuery, isLoading: isLoadingSelectionTranslation } = useTranslateSelection(
    text,
    translationSentence,
    selectionTranslationData?.chunks || [],
    selectionTranslationData?.positions || [],
    dialect,
    targetLanguage || motherLanguage
  )

  const translation: string | undefined = translationData?.translation
  const audioIndividualWord: string | null = audioIndividualWordData?.audio ?? null

  // For mother language sentences, we need to wait for translation before audio generation
  // This determines if we should show loading state immediately
  const isWaitingForTranslation = language !== studyLanguage && !!wordToTranslate && !translationData?.translation

  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD],
  })

  const onDownload = () => {
    POSTHOG_EVENTS.click('download_generated_word_audio')
    if (audioIndividualWord) {
      handleDownload(audioIndividualWord, `word--${sanitizeTextForFileName(audioWord || 'individual_word_audio')}`)
    }
  }

  const getWordPosition = useCallback(
    (wordIndex: number) => {
      let position = 0
      for (let i = 0; i < wordIndex; i++) {
        const word = words[i]
        position += word.length
        // Add space after word if not the last word
        if (i < words.length - 1) {
          position += 1
        }
      }
      return position
    },
    [words]
  )

  const handleWordClick = useCallback(
    (wordIndex: number) => {
      if (!isSelectionMode) return

      const newSelectedWords = new Set(selectedWords)

      if (selectedWords.has(wordIndex)) {
        newSelectedWords.delete(wordIndex)
      } else {
        newSelectedWords.add(wordIndex)
      }

      setSelectedWords(newSelectedWords)

      // Show dropdown on selected words when we have multiple words selected
      if (newSelectedWords.size > 1) {
        // Show dropdown on the most recently clicked word if it's selected, or the last selected word
        if (newSelectedWords.has(wordIndex)) {
          setDropdownWordIndex(wordIndex)
        } else {
          // If we deselected a word, show dropdown on the highest index selected word
          const maxSelectedIndex = Math.max(...Array.from(newSelectedWords))
          setDropdownWordIndex(maxSelectedIndex)
        }
      } else {
        setDropdownWordIndex(null)
      }
    },
    [isSelectionMode, selectedWords]
  )

  const handleTranslationClick = useCallback(
    (word: string, wordIndex: number) => {
      if (!isSelectionMode) {
        setSelectedWordIndex(wordIndex)
        setWordToTranslate(word)

        if (onSelection) {
          const wordPosition = getWordPosition(wordIndex)
          onSelection([word], [wordPosition], language)
        }
      }
    },
    [isSelectionMode, onSelection, getWordPosition, language]
  )

  const handleFinishSelection = useCallback(() => {
    if (selectedWords.size > 0) {
      const sortedIndices = Array.from(selectedWords).sort((a, b) => a - b)

      // Group adjacent words into chunks, but keep all chunks in a single selection
      const selectionChunks: string[] = []
      const selectionPositions: number[] = []
      let currentSelectionChunk: string[] = []
      let currentSelectionChunkStartPosition: number | null = null

      for (let i = 0; i < sortedIndices.length; i++) {
        const currentIndex = sortedIndices[i]
        const nextIndex = sortedIndices[i + 1]

        // Add current word to selection chunk
        currentSelectionChunk.push(words[currentIndex])
        if (currentSelectionChunkStartPosition === null) {
          currentSelectionChunkStartPosition = getWordPosition(currentIndex)
        }

        // If next word is not adjacent, finish current selection chunk and start new one
        if (nextIndex === undefined || nextIndex !== currentIndex + 1) {
          selectionChunks.push(currentSelectionChunk.join(' '))
          selectionPositions.push(currentSelectionChunkStartPosition!)
          currentSelectionChunk = []
          currentSelectionChunkStartPosition = null
        }
      }

      // Set translation data for popover (will trigger API call)
      if (selectionChunks.length > 0) {
        const lastSelectedWordIndex = Math.max(...sortedIndices)
        const selectionData = {
          chunks: selectionChunks,
          positions: selectionPositions,
          language: language,
          translation: '', // Will be populated by the query
          lastSelectedWordIndex: lastSelectedWordIndex,
        }
        setSelectionTranslationData(selectionData)
      }

      // Send all selection chunks as a single selection
      if (selectionChunks.length > 0 && onSelection) {
        onSelection(selectionChunks, selectionPositions, language)
      }
    }
    setSelectedWords(new Set())
    setDropdownWordIndex(null)
  }, [selectedWords, words, getWordPosition, onSelection, language])

  if (!isSelectionMode) {
    return (
      <div className='flex flex-wrap justify-center gap-2'>
        {words.map((word, index) => (
          <div key={`${word}--${index}`}>
            <Popover>
              <PopoverTrigger>
                <div
                  onClick={() => handleTranslationClick(word, index)}
                  className='flex h-8 cursor-pointer items-center rounded-xl border border-gray-200 bg-white transition-colors duration-100 hover:bg-gray-100 active:bg-gray-200 md:h-10'
                >
                  <SelectableWord word={word} />
                </div>
              </PopoverTrigger>
              <PopoverContent className='bg-white shadow-lg'>
                <div className='flex flex-col items-start gap-2'>
                  <CopyableTranslation translation={translation} />
                  {hasVoice && (
                    <>
                      <Separator className='my-2' />
                      <div className='flex w-full items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <PlayExpectedWordButton
                            audioIndividualWord={audioIndividualWord}
                            isWaitingForData={isWaitingForTranslation}
                          />
                        </div>
                        <button
                          onClick={onDownload}
                          disabled={!!isFetchingAudioIndividualWord}
                          className='flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-300 active:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <Download className='h-6 w-6 text-stone-700 hover:text-stone-900 active:text-stone-900' />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className='flex flex-wrap justify-center gap-2'>
        {words.map((word, index) => {
          const isSelected = selectedWords.has(index)
          const shouldShowDropdown = dropdownWordIndex === index && selectedWords.size > 1 && !selectionTranslationData
          const shouldShowSelectionPopover =
            selectionTranslationData && selectionTranslationData.lastSelectedWordIndex === index

          return (
            <div key={index} className='relative'>
              {shouldShowSelectionPopover ? (
                <Popover
                  open={!!selectionTranslationData}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectionTranslationData(null)
                      // Exit selection mode when translation popover is dismissed
                      if (onExitSelectionMode) {
                        onExitSelectionMode()
                      }
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <div
                      onClick={() => handleWordClick(index)}
                      className={cn(
                        'flex h-8 cursor-pointer items-center rounded-xl border border-gray-200 bg-white transition-colors duration-100 md:h-10',
                        {
                          'border-blue-300 bg-blue-200 text-blue-800': isSelected,
                          'hover:bg-gray-100 active:bg-gray-200': !isSelected,
                        }
                      )}
                    >
                      <span className='w-full px-2 text-gray-700 md:px-4 md:text-gray-600'>{word}</span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className='bg-white shadow-lg'>
                    <div className='flex flex-col items-start justify-center gap-4 p-2'>
                      <div className='w-full'>
                        {isLoadingSelectionTranslation ? (
                          <div className='flex items-center gap-2 p-2'>
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent'></div>
                            <span className='text-sm text-gray-600'>{t`Translating...`}</span>
                          </div>
                        ) : (
                          <CopyableTranslation
                            translation={selectionTranslationDataQuery?.translation || t`Translation not available`}
                          />
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <>
                  <div
                    onClick={() => handleWordClick(index)}
                    className={cn(
                      'flex h-8 cursor-pointer items-center rounded-xl border border-gray-200 bg-white transition-colors duration-100 md:h-10',
                      {
                        'border-blue-300 bg-blue-200 text-blue-800': isSelected,
                        'hover:bg-gray-100 active:bg-gray-200': !isSelected,
                      }
                    )}
                  >
                    <span className='w-full px-2 text-gray-700 md:px-4 md:text-gray-600'>{word}</span>
                  </div>
                  {shouldShowDropdown && (
                    <Popover open={shouldShowDropdown} onOpenChange={(open) => !open && setDropdownWordIndex(null)}>
                      <PopoverTrigger asChild>
                        <div className='sr-only' />
                      </PopoverTrigger>
                      <PopoverContent className='w-48 bg-white p-1.5 shadow-lg'>
                        <div className='flex flex-col gap-1'>
                          <button
                            onClick={handleFinishSelection}
                            className='flex w-full items-center rounded-lg px-2 py-2 text-sm hover:bg-gray-100'
                          >
                            {t`End Selection`}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWords(new Set())
                              setDropdownWordIndex(null)
                            }}
                            className='flex w-full items-center rounded-lg px-2 py-2 text-sm hover:bg-gray-100'
                          >
                            {t`Clear Selection`}
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
