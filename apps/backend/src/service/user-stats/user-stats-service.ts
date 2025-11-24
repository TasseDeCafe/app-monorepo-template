import {
  DbGetDailyWeightedLengthsResult,
  XpRepositoryInterface,
  DbGetLeaderboardDataResult,
  DbLeaderboardUserData,
} from '../../transport/database/xp/xp-repository-types'
import { PRONUNCIATION_EXERCISE_FACTOR } from './user-stats-constants'
import { logCustomErrorMessageAndError } from '../../transport/third-party/sentry/error-monitoring'
import { UserStats } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import {
  calculateCurrentStreakFromXp,
  calculateLongestStreakFromXp,
  calculateNumberOfAchievedStreakBadgesFromXp,
  calculateTotalDaysLearnedFromXp,
  calculateXpEarnedToday,
  calculateTotalXp,
  getNumberOfDaysOfNextStreakBadgeFromXp,
} from './user-stats-utils'

export interface LeaderboardEntry {
  nickname: string | null
  xp: number
}

export interface LeaderboardData {
  xp: {
    allTime: LeaderboardEntry[]
    weekly: LeaderboardEntry[]
    byLanguage: Record<
      string,
      {
        allTime: LeaderboardEntry[]
        weekly: LeaderboardEntry[]
      }
    >
  }
}

export type LeaderboardResult =
  | {
      isSuccess: false
      leaderboardData: null
    }
  | {
      isSuccess: true
      leaderboardData: LeaderboardData
    }

export interface UserStatsServiceInterface {
  getUserStatsForUser(userId: string): Promise<UserStatsResult>
  getLeaderboard(): Promise<LeaderboardResult>
}

export type UserStatsResult =
  | {
      isSuccess: false
      userStats: null
    }
  | {
      isSuccess: true
      userStats: UserStats
    }

export const UserStatsService = (xpRepository: XpRepositoryInterface): UserStatsServiceInterface => {
  const getUserStatsForUser = async (userId: string): Promise<UserStatsResult> => {
    try {
      const dailyWeightedResult: DbGetDailyWeightedLengthsResult = await xpRepository.getDailyWeightedLengths(userId)

      if (!dailyWeightedResult.isSuccess) {
        return {
          isSuccess: false,
          userStats: null,
        }
      }

      const sortedDailyXp = dailyWeightedResult.dailyData.map((day) => ({
        date: day.date,
        xpOnDate: Math.round(day.total_weighted_length * PRONUNCIATION_EXERCISE_FACTOR),
      }))

      const currentStreak = calculateCurrentStreakFromXp(sortedDailyXp)
      const longestStreak = calculateLongestStreakFromXp(sortedDailyXp)
      const totalDaysLearned = calculateTotalDaysLearnedFromXp(sortedDailyXp)
      const numberOfDaysOfNextStreakBadge = getNumberOfDaysOfNextStreakBadgeFromXp(sortedDailyXp)
      const numberOfAchievedStreakBadges = calculateNumberOfAchievedStreakBadgesFromXp(sortedDailyXp)
      const xpEarnedToday = calculateXpEarnedToday(sortedDailyXp)
      const totalXp = calculateTotalXp(sortedDailyXp)

      return {
        isSuccess: true,
        userStats: {
          currentStreak,
          longestStreak,
          totalDaysLearned,
          numberOfDaysOfNextStreakBadge,
          numberOfAchievedStreakBadges,
          xpEarnedToday,
          totalXp,
        },
      }
    } catch (e) {
      logCustomErrorMessageAndError(`getUserStatsForUser error, userId = ${userId}`, e)
      return {
        isSuccess: false,
        userStats: null,
      }
    }
  }

  const getLeaderboard = async (): Promise<LeaderboardResult> => {
    try {
      const leaderboardDataResult: DbGetLeaderboardDataResult = await xpRepository.getLeaderboardData()

      if (!leaderboardDataResult.isSuccess) {
        return {
          isSuccess: false,
          leaderboardData: null,
        }
      }

      const convertToXp = (weightedLength: number): number => Math.round(weightedLength * PRONUNCIATION_EXERCISE_FACTOR)

      // Initialize result structures - SQL query has already done aggregation, ranking, and limiting
      const overallAllTime: LeaderboardEntry[] = []
      const overallWeekly: LeaderboardEntry[] = []
      const byLanguageResult: Record<string, { allTime: LeaderboardEntry[]; weekly: LeaderboardEntry[] }> = {}

      // Process the pre-filtered and pre-sorted data from the repository
      leaderboardDataResult.userData.forEach((user: DbLeaderboardUserData) => {
        const xp = convertToXp(user.total_weighted_length)
        const entry: LeaderboardEntry = { nickname: user.nickname, xp }

        if (!user.language) {
          // Overall leaderboard entries (language is NULL in the SQL result)
          if (user.time_period === 'all_time') {
            overallAllTime.push(entry)
          } else if (user.time_period === 'weekly') {
            overallWeekly.push(entry)
          }
        } else {
          // By-language leaderboard entries
          if (!byLanguageResult[user.language]) {
            byLanguageResult[user.language] = { allTime: [], weekly: [] }
          }

          if (user.time_period === 'all_time') {
            byLanguageResult[user.language].allTime.push(entry)
          } else if (user.time_period === 'weekly') {
            byLanguageResult[user.language].weekly.push(entry)
          }
        }
      })

      return {
        isSuccess: true,
        leaderboardData: {
          xp: {
            allTime: overallAllTime,
            weekly: overallWeekly,
            byLanguage: byLanguageResult,
          },
        },
      }
    } catch (e) {
      logCustomErrorMessageAndError('getLeaderboard error', e)
      return {
        isSuccess: false,
        leaderboardData: null,
      }
    }
  }

  return {
    getUserStatsForUser,
    getLeaderboard,
  }
}
