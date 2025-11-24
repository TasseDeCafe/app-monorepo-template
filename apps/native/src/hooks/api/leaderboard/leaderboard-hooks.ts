import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { LeaderboardEntry, TimePeriodKey } from '@yourbestaccent/api-client/orpc-contracts/leaderboard-contract'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export type TimePeriodFilterValue = TimePeriodKey
export type LanguageFilterValue = SupportedStudyLanguage | undefined

export const useGetLeaderboard = (
  selectedLanguage?: LanguageFilterValue,
  selectedTimePeriod: TimePeriodFilterValue = 'allTime'
) => {
  const { t } = useLingui()
  const { data: leaderboardData, isLoading } = useQuery(
    orpcQuery.leaderboard.getLeaderboard.queryOptions({
      queryKey: [QUERY_KEYS.LEADERBOARD],
      select: (response) => response.data,
      meta: {
        errorMessage: t`Failed to fetch leaderboard data`,
      },
    })
  )

  const getEntriesForCurrentView = useCallback((): LeaderboardEntry[] => {
    if (!leaderboardData?.xp) {
      return []
    }

    if (!selectedLanguage) {
      return leaderboardData.xp[selectedTimePeriod] || []
    }

    return leaderboardData.xp.byLanguage[selectedLanguage]?.[selectedTimePeriod] || []
  }, [leaderboardData, selectedLanguage, selectedTimePeriod])

  return {
    entries: getEntriesForCurrentView(),
    isLoading,
  }
}
