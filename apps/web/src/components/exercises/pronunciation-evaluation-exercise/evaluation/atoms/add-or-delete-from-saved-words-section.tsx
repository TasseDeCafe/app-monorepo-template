import { Star } from 'lucide-react'
import { Button } from '../../../../design-system/button.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { NavLink } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useAddSavedWord, useIsWordSaved, useRemoveSavedWord } from '@/hooks/api/saved-words/saved-words-hooks'
import { useLingui } from '@lingui/react/macro'

interface AddOrDeleteFromSavedWordsButtonProps {
  language: SupportedStudyLanguage
  contextWords: string[]
  wordIndex: number
}

export const AddOrDeleteFromSavedWordsSection = ({
  language,
  contextWords,
  wordIndex,
}: AddOrDeleteFromSavedWordsButtonProps) => {
  const { t } = useLingui()

  const word = contextWords[wordIndex]

  const { data: isSaved } = useIsWordSaved(word, language)

  const { mutate: addSavedWord } = useAddSavedWord()
  const { mutate: removeSavedWord } = useRemoveSavedWord()

  const handleToggleSavedStatus = () => {
    if (isSaved) {
      POSTHOG_EVENTS.click('remove_saved_word')
      removeSavedWord({
        language,
        contextWords,
        wordIndex,
      })
    } else {
      POSTHOG_EVENTS.click('add_saved_word')
      addSavedWord({
        language,
        contextWords,
        wordIndex,
      })
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        onClick={handleToggleSavedStatus}
        className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 p-0'
      >
        <Star className={cn(`h-5 min-h-5 w-5 min-w-5 stroke-white ${isSaved ? 'fill-white' : 'fill-none'}`)} />
      </Button>
      <NavLink to={ROUTE_PATHS.PROGRESS_STATS_SAVED_WORDS} className='text-sm underline'>
        {t`Go to saved words`}
      </NavLink>
    </div>
  )
}
