import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../../../../../shadcn/popover.tsx'
import { Separator } from '../../../../../design-system/separator.tsx'
import { useIsFetching } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '../../../../../../state/slices/account-slice.ts'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes.ts'
import { Download } from 'lucide-react'
import { PlaySavedWord } from './play-saved-word.tsx'
import { POSTHOG_EVENTS } from '../../../../../../analytics/posthog/posthog-events.ts'
import { handleDownload, sanitizeTextForFileName } from '../../../../../audio-player/audio-player-utils.ts'
import { CopyableTranslation } from '@/components/exercises/pronunciation-evaluation-exercise/atoms/copyable-translation.tsx'

import { useTranslateWord } from '@/hooks/api/translation/translation-hooks'
import { useGeneratedAudioSavedWord } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useLingui } from '@lingui/react/macro'

export const PopoverForSavedWord = ({ word }: { word: string }) => {
  const { t } = useLingui()

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const motherLanguage: LangCode = useSelector(selectMotherLanguageOrEnglish)
  const hasVoice: boolean = useSelector(selectHasVoice)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const [hasTappedOnWord, setHasTappedOnWord] = useState(false)

  const isFetchingAudioIndividualWord = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_SAVED_WORD],
  })

  const { data: audioIndividualWordData } = useGeneratedAudioSavedWord(
    word,
    studyLanguage,
    dialect,
    hasVoice,
    hasTappedOnWord
  )

  const contextWords = [word]
  const selectedWordIndex = 0

  const { data: translationData } = useTranslateWord(word, dialect, motherLanguage, contextWords, selectedWordIndex)

  const audioIndividualWord: string | null = audioIndividualWordData?.audio ?? null

  const translation: string | undefined = translationData?.translation

  const onDownload = () => {
    POSTHOG_EVENTS.click('download_saved_word_pronunciation')
    if (audioIndividualWord) {
      handleDownload(audioIndividualWord, `saved-word--${sanitizeTextForFileName(word || 'saved_word_audio')}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <span
          onClick={() => {
            setHasTappedOnWord(true)
          }}
        >
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent className='min-w-[19rem] max-w-[24rem] bg-white shadow-lg'>
        <div className='flex flex-col items-start gap-2'>
          <CopyableTranslation translation={translation} />
          <Separator className='my-2' />
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <PlaySavedWord audioIndividualWord={audioIndividualWord} />
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
        </div>
      </PopoverContent>
    </Popover>
  )
}
