export interface DbDailyWeightedLength {
  date: string
  total_weighted_length: number
}

export type DbGetDailyWeightedLengthsResult =
  | {
      isSuccess: true
      dailyData: DbDailyWeightedLength[]
    }
  | {
      isSuccess: false
      dailyData: null
    }

export interface DbLeaderboardUserData {
  user_id: string
  nickname: string | null
  language: string | null
  time_period: string
  total_weighted_length: number
}

export type DbGetLeaderboardDataResult =
  | {
      isSuccess: true
      userData: DbLeaderboardUserData[]
    }
  | {
      isSuccess: false
      userData: null
    }

export interface XpRepositoryInterface {
  getDailyWeightedLengths: (userId: string) => Promise<DbGetDailyWeightedLengthsResult>
  getLeaderboardData: () => Promise<DbGetLeaderboardDataResult>
}
