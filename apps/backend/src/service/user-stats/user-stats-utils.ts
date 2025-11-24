import { XpObtainedInADay } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import { STREAK_BADGE_THRESHOLDS } from '@yourbestaccent/core/constants/badges-constants'

export const calculateCurrentStreakFromXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData || !xpData.length) {
    return 0
  }

  const sortedDays = [...xpData]
    .filter((day) => day.xpOnDate > 0) // Only count days with XP earned
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (!sortedDays.length) {
    return 0
  }

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

export const calculateTotalDaysLearnedFromXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData) {
    return 0
  }
  return xpData.filter((day) => day.xpOnDate > 0).length
}

export const calculateXpEarnedToday = (xpData: XpObtainedInADay[]): number => {
  if (!xpData || !xpData.length) {
    return 0
  }
  const today = new Date().toISOString().split('T')[0]
  const todayData = xpData.find((day: XpObtainedInADay) => day.date === today)
  return todayData ? todayData.xpOnDate : 0
}

export const calculateLongestStreakFromXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData || !xpData.length) {
    return 0
  }

  const sortedDays = [...xpData]
    .filter((day) => day.xpOnDate > 0) // Only count days with XP earned
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (!sortedDays.length) {
    return 0
  }

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

export const calculateNumberOfAchievedStreakBadgesFromXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData) {
    return 0
  }

  const longestStreak = calculateLongestStreakFromXp(xpData)
  return STREAK_BADGE_THRESHOLDS.filter((threshold) => longestStreak >= threshold).length
}

export const getNumberOfDaysOfNextStreakBadgeFromXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData) {
    return STREAK_BADGE_THRESHOLDS[0]
  }

  const longestStreak = calculateLongestStreakFromXp(xpData)
  const nextThreshold = STREAK_BADGE_THRESHOLDS.find((threshold) => threshold > longestStreak)

  return nextThreshold ? nextThreshold : 0
}

export const calculateTotalXp = (xpData: XpObtainedInADay[]): number => {
  if (!xpData || !xpData.length) {
    return 0
  }
  return xpData.reduce((total, day) => total + day.xpOnDate, 0)
}
