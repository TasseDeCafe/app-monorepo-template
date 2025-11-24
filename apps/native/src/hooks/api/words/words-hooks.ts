// TODO: most of this code should be shared,
// but first, we need to finish the migration to ts-rest
import { STREAK_BADGE_THRESHOLDS } from '@template-app/core/constants/badges-constants'
import { useMemo } from 'react'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { UserWordsData } from '@template-app/api-client/orpc-contracts/words-contract'

export const __calculateCurrentStreak = (data: UserWordsData | undefined): number => {
  if (!data || !data.learnedWordsByDay.length) {
    return 0
  }

  const sortedDays = [...data.learnedWordsByDay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let streak = 0
  let currentDate = new Date()

  for (const day of sortedDays) {
    const dayDate = new Date(day.date)
    const diffDays = Math.floor((currentDate.getTime() - dayDate.getTime()) / (1000 * 3600 * 24))

    if (diffDays <= 1) {
      streak++
      currentDate = dayDate
    } else {
      break
    }
  }

  return streak
}

export const __calculateLongestStreak = (data: UserWordsData | undefined): number => {
  if (!data || !data.learnedWordsByDay.length) {
    return 0
  }

  const sortedDays = [...data.learnedWordsByDay].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let longestStreak = 0
  let currentStreak = 0
  let previousDate: Date | null = null

  for (const day of sortedDays) {
    const currentDate = new Date(day.date)
    if (previousDate) {
      const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24))
      if (diffDays === 1) {
        currentStreak++
      } else {
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    previousDate = currentDate
  }

  return Math.max(longestStreak, currentStreak)
}

export const __getNumberOfDaysOfNextStreakBadge = (data: UserWordsData | undefined): number => {
  if (!data) {
    return STREAK_BADGE_THRESHOLDS[0]
  }

  const longestStreak = __calculateLongestStreak(data)
  const nextThreshold = STREAK_BADGE_THRESHOLDS.find((threshold) => threshold > longestStreak)

  return nextThreshold ? nextThreshold : 0
}

const useUserWordsData = () => {
  const { defaultedUserData: user } = useGetUser()
  return {
    data: {
      counters: user.counters,
      learnedWordsByDay: user.learnedWordsByDay,
    },
  }
}

export const useCurrentStreak = (): number => {
  const { data } = useUserWordsData()
  return useMemo(() => __calculateCurrentStreak(data), [data])
}

export const useLongestStreak = (): number => {
  const { data } = useUserWordsData()
  return useMemo(() => __calculateLongestStreak(data), [data])
}

export const useGetNumberOfDaysOfNextStreakBadge = (): number => {
  const { data } = useUserWordsData()
  return useMemo(() => __getNumberOfDaysOfNextStreakBadge(data), [data])
}
