import { describe, it, expect } from 'vitest'
import { XpObtainedInADay } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import {
  calculateCurrentStreakFromXp,
  calculateTotalDaysLearnedFromXp,
  calculateXpEarnedToday,
  calculateLongestStreakFromXp,
  calculateNumberOfAchievedStreakBadgesFromXp,
  getNumberOfDaysOfNextStreakBadgeFromXp,
} from './user-stats-utils'

describe('user-stats-utils', () => {
  const createXpData = (datesAndXp: [string, number][]): XpObtainedInADay[] => {
    return datesAndXp.map(([date, xp]) => ({ date, xpOnDate: xp }))
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  describe('calculateCurrentStreakFromXp', () => {
    it('should return 0 for empty array', () => {
      expect(calculateCurrentStreakFromXp([])).toBe(0)
    })

    it('should return 0 when no XP earned on any day', () => {
      const xpData = createXpData([
        [today, 0],
        [yesterday, 0],
        [twoDaysAgo, 0],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(0)
    })

    it('should return 1 for current streak of 1 day (today only)', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 0],
        [twoDaysAgo, 0],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(1)
    })

    it('should return 1 for current streak of 1 day (yesterday only)', () => {
      const xpData = createXpData([
        [today, 0],
        [yesterday, 100],
        [twoDaysAgo, 0],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(1)
    })

    it('should return 2 for current streak of 2 days (today and yesterday)', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 0],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(2)
    })

    it('should return 3 for current streak of 3 consecutive days', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 75],
        [threeDaysAgo, 0],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(3)
    })

    it('should break streak when there is a gap', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [threeDaysAgo, 75],
        [fourDaysAgo, 25],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(2)
    })

    it('should break streak when there is a 0 xp', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 0],
        [threeDaysAgo, 75],
        [fourDaysAgo, 25],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(2)
    })

    it('should handle unordered data correctly', () => {
      const xpData = createXpData([
        [threeDaysAgo, 0],
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 75],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(3)
    })

    it('should ignore days with 0 XP in the middle of streak calculation', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 0], // This should break the streak
        [twoDaysAgo, 75],
      ])
      expect(calculateCurrentStreakFromXp(xpData)).toBe(1)
    })
  })

  describe('calculateTotalDaysLearnedFromXp', () => {
    it('should return 0 for empty array', () => {
      expect(calculateTotalDaysLearnedFromXp([])).toBe(0)
    })

    it('should return 0 when no XP earned on any day', () => {
      const xpData = createXpData([
        [today, 0],
        [yesterday, 0],
        [twoDaysAgo, 0],
      ])
      expect(calculateTotalDaysLearnedFromXp(xpData)).toBe(0)
    })

    it('should count only days with XP > 0', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 0],
        [twoDaysAgo, 75],
        [threeDaysAgo, 0],
        [fourDaysAgo, 25],
      ])
      expect(calculateTotalDaysLearnedFromXp(xpData)).toBe(3)
    })

    it('should count all days with any XP earned', () => {
      const xpData = createXpData([
        [today, 1],
        [yesterday, 100],
        [twoDaysAgo, 1000],
      ])
      expect(calculateTotalDaysLearnedFromXp(xpData)).toBe(3)
    })
  })

  describe('calculateXpEarnedToday', () => {
    it('should return 0 for empty array', () => {
      expect(calculateXpEarnedToday([])).toBe(0)
    })

    it('should return 0 when no XP earned today', () => {
      const xpData = createXpData([
        [today, 0],
        [yesterday, 100],
      ])
      expect(calculateXpEarnedToday(xpData)).toBe(0)
    })

    it('should return correct XP earned today', () => {
      const xpData = createXpData([
        [today, 150],
        [yesterday, 100],
      ])
      expect(calculateXpEarnedToday(xpData)).toBe(150)
    })

    it('should return 0 when today is not in the data', () => {
      const xpData = createXpData([
        [yesterday, 100],
        [twoDaysAgo, 50],
      ])
      expect(calculateXpEarnedToday(xpData)).toBe(0)
    })
  })

  describe('calculateLongestStreakFromXp', () => {
    it('should return 0 for empty array', () => {
      expect(calculateLongestStreakFromXp([])).toBe(0)
    })

    it('should return 0 when no XP earned on any day', () => {
      const xpData = createXpData([
        [today, 0],
        [yesterday, 0],
        [twoDaysAgo, 0],
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(0)
    })

    it('should return 1 for single day with XP', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 0],
        [twoDaysAgo, 0],
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(1)
    })

    it('should return correct longest streak when current streak is longest', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 75],
        [threeDaysAgo, 0], // gap
        [fourDaysAgo, 25],
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(3)
    })

    it('should return correct longest streak when past streak is longest', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 0], // gap
        [twoDaysAgo, 75],
        [threeDaysAgo, 50],
        [fourDaysAgo, 25],
        [fiveDaysAgo, 30],
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(4)
    })

    it('should handle multiple streaks of same length', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 0], // gap
        [threeDaysAgo, 75],
        [fourDaysAgo, 25],
        [fiveDaysAgo, 0], // gap
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(2)
    })

    it('should handle unordered data correctly', () => {
      const xpData = createXpData([
        [fourDaysAgo, 25],
        [today, 100],
        [twoDaysAgo, 75],
        [yesterday, 50],
        [threeDaysAgo, 60],
      ])
      expect(calculateLongestStreakFromXp(xpData)).toBe(5)
    })
  })

  describe('calculateNumberOfAchievedStreakBadgesFromXp', () => {
    it('should return 0 for empty array', () => {
      expect(calculateNumberOfAchievedStreakBadgesFromXp([])).toBe(0)
    })

    it('should return correct number of badges based on longest streak', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 75],
        [threeDaysAgo, 60],
        [fourDaysAgo, 25],
      ])

      const result = calculateNumberOfAchievedStreakBadgesFromXp(xpData)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(2) // At most 2 badges for a 5-day streak
    })
  })

  describe('getNumberOfDaysOfNextStreakBadgeFromXp', () => {
    it('should return first threshold for empty array', () => {
      const result = getNumberOfDaysOfNextStreakBadgeFromXp([])
      expect(result).toBeGreaterThan(0) // Should return first threshold
    })

    it('should return 0 when all badges achieved', () => {
      // Create data with very long streak that exceeds all thresholds (highest is 500)
      const longStreakData = createXpData(
        Array.from({ length: 600 }, (_, i) => {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          return [date, 100]
        })
      )

      const result = getNumberOfDaysOfNextStreakBadgeFromXp(longStreakData)
      expect(result).toBe(0)
    })

    it('should return next threshold for current streak', () => {
      const xpData = createXpData([
        [today, 100],
        [yesterday, 50],
        [twoDaysAgo, 75],
      ])

      const result = getNumberOfDaysOfNextStreakBadgeFromXp(xpData)
      expect(result).toBeGreaterThan(3) // Should be next threshold after 3
    })
  })
})
