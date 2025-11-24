import { BadgeSection } from '../badges.tsx'
import { createLanguageCountBadges } from '../badge-builders.ts'
import { BadgeData } from '../badge-card.tsx'
import { useGetNumberOfLanguagesLearned } from '@/hooks/api/words/words-hooks'

export const LanguagesBadgesSubTab = () => {
  const languagesLearned = useGetNumberOfLanguagesLearned()

  const multiLanguageBadges: BadgeData[] = createLanguageCountBadges(languagesLearned)
  return (
    <div className='flex w-full flex-col justify-center gap-x-8 gap-y-8 md:w-2/3 3xl:w-1/4'>
      <BadgeSection title='Multi-Language' badges={multiLanguageBadges} />
    </div>
  )
}
