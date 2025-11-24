import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { DialectCode, SupportedMotherLanguage, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { Popover, PopoverContent, PopoverTrigger } from '../../shadcn/popover.tsx'
import { useState } from 'react'
import { selectShouldShowIpa, selectShouldShowTransliteration } from '@/state/slices/preferences-slice.ts'
import { AddOrDeleteFromSavedWordsSection } from './evaluation/atoms/add-or-delete-from-saved-words-section.tsx'
import { Separator } from '../../design-system/separator.tsx'
import { CopyableIpaWord } from './atoms/copyable-ipa-word.tsx'
import { CopyableTranslation } from './atoms/copyable-translation.tsx'
import { CopyableTransliteratedWord } from './atoms/copyable-transliterated-word.tsx'
import { NarrowSkeleton } from './atoms/narrow-skeleton.tsx'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { SelectableWord } from '@/components/design-system/selectable-word'
import { useTranslateWord, useTranslateText } from '@/hooks/api/translation/translation-hooks'
import { useIpaTranscription } from '@/hooks/api/ipa-transcription/ipa-transcription-hooks'
import { useTransliteration } from '@/hooks/api/transliteration/transliteration-hooks'

type Props = {
  text: string
  studyLanguage: SupportedStudyLanguage
  overrideShowIpa?: boolean
}

export const TextForExercise = ({ text, studyLanguage, overrideShowIpa }: Props) => {
  const words: string[] = splitTextIntoWords(text, studyLanguage)
  const motherLanguage: SupportedMotherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const [textToTranslate, setTextToTranslate] = useState<string>('')
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const shouldShowIpaFromStore: boolean = useSelector(selectShouldShowIpa)
  const shouldShowIpa: boolean = overrideShowIpa ?? shouldShowIpaFromStore
  const shouldShowTransliteration =
    useSelector(selectShouldShowTransliteration) && isLanguageWithTransliteration(studyLanguage)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)

  const { data: translationData } = useTranslateWord(textToTranslate, dialect, motherLanguage, words, selectedWordIndex)

  const { data: ipaTranscriptionData } = useIpaTranscription(text, studyLanguage, dialect)

  const { data: transliterationData } = useTransliteration(text, studyLanguage)

  // We call the text translation query here so that it's already loaded when the user opens the translation modal
  useTranslateText(text, dialect, motherLanguage, 'dummy-token')

  const translation: string | undefined = translationData?.translation
  const ipaTranscriptionWords: string[] | undefined = ipaTranscriptionData?.data.ipaTranscription
  const transliterationWords: string[] | undefined = splitTextIntoWords(
    transliterationData?.transliteration || '',
    studyLanguage
  )

  const handleTap = (text: string | null, wordIndex: number) => {
    if (text) {
      setSelectedWordIndex(wordIndex)
      setTextToTranslate(text)
    }
  }

  return (
    <div className='mb-4 flex flex-col items-center gap-2 px-1 md:max-w-3xl'>
      <div className='mb-4 flex w-full flex-wrap justify-center gap-2 px-1'>
        {words.map((word: string, index: number) => {
          const hasTransliteration = transliterationWords && transliterationWords[index]
          const hasIpa = ipaTranscriptionWords && ipaTranscriptionWords[index]
          return (
            <div className='flex flex-col gap-y-0' key={'word' + index}>
              {/*to understand this hell have a look at:*/}
              {/*https://www.notion.so/grammarians/Tons-of-divs-for-below-and-above-the-words-21efda77261a4161b2018f6470ff7803*/}
              {isLanguageWithTransliteration(studyLanguage) && !shouldShowTransliteration && <div className='h-6' />}
              {!shouldShowIpa && <div className='h-6' />}
              {isLanguageWithTransliteration(studyLanguage) && shouldShowTransliteration && hasTransliteration && (
                <CopyableTransliteratedWord text={transliterationWords[index]} />
              )}
              {shouldShowTransliteration && !hasTransliteration && <NarrowSkeleton />}
              {shouldShowIpa && hasIpa && <CopyableIpaWord text={ipaTranscriptionWords[index]} />}
              {shouldShowIpa && !hasIpa && <NarrowSkeleton />}
              <Popover>
                <PopoverTrigger>
                  <div
                    onClick={() => handleTap(word, index)}
                    className='flex h-8 items-center rounded-xl border border-gray-200 transition-colors duration-100 hover:bg-gray-100 active:bg-gray-200 md:h-10'
                  >
                    <SelectableWord word={word} />
                  </div>
                </PopoverTrigger>
                <PopoverContent className='bg-white shadow-lg'>
                  <div className='flex flex-col items-start justify-center gap-4 p-2'>
                    <CopyableTranslation translation={translation} />
                    <Separator />
                    <AddOrDeleteFromSavedWordsSection language={studyLanguage} contextWords={words} wordIndex={index} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )
        })}
      </div>
    </div>
  )
}
