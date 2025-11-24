import { Streak } from './streak.tsx'
import { useEffect } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import {
  useCurrentStreakFromXp,
  useGetNumberOfDaysOfNextStreakBadgeFromXp,
  useLongestStreakFromXp,
  useNumberOfAchievedStreakBadgesFromXp,
} from '@/hooks/api/user/user-hooks'

export const StreakTab = () => {
  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  return (
    <div className='flex h-full w-full flex-col items-center py-4'>
      <Streak
        currentStreak={useCurrentStreakFromXp()}
        longestStreak={useLongestStreakFromXp()}
        numberOfDaysOfNextStreakBadge={useGetNumberOfDaysOfNextStreakBadgeFromXp()}
        numberOfAchievedStreakBadges={useNumberOfAchievedStreakBadgesFromXp()}
      />
    </div>
  )
}
