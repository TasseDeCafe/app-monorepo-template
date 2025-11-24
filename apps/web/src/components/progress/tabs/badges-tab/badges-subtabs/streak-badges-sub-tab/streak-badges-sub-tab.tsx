import { BadgeSection } from '../badges.tsx'
import { createStreakBadges } from '../badge-builders.ts'
import { BadgeData } from '../badge-card.tsx'
import { useCurrentStreakFromXp, useLongestStreakFromXp } from '@/hooks/api/user/user-hooks'

export const StreakBadgesSubTab = () => {
  const currentStreak = useCurrentStreakFromXp()
  const longestStreak = useLongestStreakFromXp()

  const streakBadges: BadgeData[] = createStreakBadges(currentStreak, longestStreak)

  return (
    <div className='flex w-full flex-col justify-center gap-x-8 gap-y-8 md:w-2/3 3xl:w-1/4'>
      <BadgeSection title='Streak' badges={streakBadges} />
    </div>
  )
}
