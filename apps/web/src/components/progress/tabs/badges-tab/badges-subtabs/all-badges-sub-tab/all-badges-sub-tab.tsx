import { BadgeSection } from '../badges.tsx'
import { createLanguageCountBadges, createStreakBadges, createWordCountBadges } from '../badge-builders.ts'
import { useCurrentStreakFromXp, useLongestStreakFromXp } from '@/hooks/api/user/user-hooks'
import { useGetNumberOfLanguagesLearned, useNumberOfLearnedWords } from '@/hooks/api/words/words-hooks'
import { useLingui } from '@lingui/react/macro'

export const AllBadgesSubTab = () => {
  const { t } = useLingui()
  const currentStreak = useCurrentStreakFromXp()
  const longestStreak = useLongestStreakFromXp()
  const wordsLearned = useNumberOfLearnedWords()
  const languagesLearned = useGetNumberOfLanguagesLearned()

  const streakBadges = createStreakBadges(currentStreak, longestStreak)
  const wordCountBadges = createWordCountBadges(wordsLearned)
  const multiLanguageBadges = createLanguageCountBadges(languagesLearned)

  return (
    <div className='flex w-full flex-col justify-center gap-x-8 gap-y-8 xl:container md:flex-row'>
      <BadgeSection title={t`Streak`} badges={streakBadges} />
      <BadgeSection title={t`Word Count`} badges={wordCountBadges} />
      <BadgeSection title={t`Multi-Language`} badges={multiLanguageBadges} />
    </div>
  )
}
