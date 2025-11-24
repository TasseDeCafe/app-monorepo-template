import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
} from '../../../state/slices/account-slice.ts'
import { DialectCode, SupportedMotherLanguage, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { Popover, PopoverContent, PopoverTrigger } from '../../shadcn/popover.tsx'
import { useState } from 'react'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils.ts'
import { CopyableTranslation } from '@/components/exercises/pronunciation-evaluation-exercise/atoms/copyable-translation'
import { Separator } from '../../design-system/separator'
import { AddOrDeleteFromSavedWordsSection } from '@/components/exercises/pronunciation-evaluation-exercise/evaluation/atoms/add-or-delete-from-saved-words-section'
import { useTranslateWord } from '@/hooks/api/translation/translation-hooks'

type Props = {
  text: string
  studyLanguage: SupportedStudyLanguage
  overrideShowIpa?: boolean
}

export const TextForStressExercise = ({ text, studyLanguage }: Props) => {
  const words: string[] = splitTextIntoWords(text, studyLanguage)
  const motherLanguage: SupportedMotherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const [textToTranslate, setTextToTranslate] = useState<string>('')
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)

  const { data: translationData } = useTranslateWord(textToTranslate, dialect, motherLanguage, words, selectedWordIndex)

  const translation: string | undefined = translationData?.translation
  const handleTap = (text: string | null, wordIndex: number) => {
    if (text) {
      setSelectedWordIndex(wordIndex)
      setTextToTranslate(text)
    }
  }

  return (
    <div className='mx-auto mb-4 flex flex-col items-center gap-2 px-1 md:max-w-3xl'>
      <div className='mb-4 flex w-full flex-wrap justify-center'>
        {words.map((word: string, index: number) => {
          return (
            <div className='flex flex-col gap-y-0' key={'word' + index}>
              <div className='h-6' />
              <Popover>
                <PopoverTrigger>
                  <div
                    onClick={() => handleTap(word, index)}
                    className='flex h-8 items-center rounded-xl transition-colors duration-100 hover:bg-gray-100 active:bg-gray-200 md:h-10'
                  >
                    <span className='w-full px-1 text-gray-700 md:text-gray-600'>{word}</span>
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
