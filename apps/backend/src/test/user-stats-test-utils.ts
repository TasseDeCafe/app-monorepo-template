import { UserStats } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import type { ExpectStatic } from 'vitest'

export const createEmptyUserStats = (): UserStats => ({
  currentStreak: 0,
  longestStreak: 0,
  totalDaysLearned: 0,
  numberOfDaysOfNextStreakBadge: 3, // First badge threshold
  numberOfAchievedStreakBadges: 0,
  xpEarnedToday: 0,
  totalXp: 0,
})

export const createUserStatsAnyExpectation = (expect: ExpectStatic) => ({
  currentStreak: expect.any(Number),
  longestStreak: expect.any(Number),
  totalDaysLearned: expect.any(Number),
  numberOfDaysOfNextStreakBadge: expect.any(Number),
  numberOfAchievedStreakBadges: expect.any(Number),
  xpEarnedToday: expect.any(Number),
  totalXp: expect.any(Number),
})
