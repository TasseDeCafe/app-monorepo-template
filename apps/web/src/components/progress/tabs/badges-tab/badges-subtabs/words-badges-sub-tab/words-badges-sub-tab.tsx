import { BadgeSection } from '../badges.tsx'
import { createWordCountBadges } from '../badge-builders.ts'
import { BadgeData } from '../badge-card.tsx'
import { useNumberOfLearnedWords } from '@/hooks/api/words/words-hooks'
import { useLingui } from '@lingui/react/macro'

export const WordsBadgesSubTab = () => {
  const { t } = useLingui()
  const wordsLearned = useNumberOfLearnedWords()

  const wordCountBadges: BadgeData[] = createWordCountBadges(wordsLearned)
  return (
    <div className='flex w-full flex-col justify-center gap-x-8 gap-y-8 md:w-2/3 3xl:w-1/4'>
      <BadgeSection title={t`Word Count`} badges={wordCountBadges} />
    </div>
  )
}
