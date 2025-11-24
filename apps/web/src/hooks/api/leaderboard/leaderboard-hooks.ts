import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { LeaderboardEntry, TimePeriodKey } from '@template-app/api-client/orpc-contracts/leaderboard-contract'
import { SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { LanguageFilterValue } from '@/components/progress/tabs/stats-tab/stats-subtabs/learned-words/language-filter'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export type TimePeriodFilterValue = TimePeriodKey

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

    const xpData = leaderboardData.xp

    if (!selectedLanguage) {
      return xpData[selectedTimePeriod] || []
    }

    const byLanguage = xpData.byLanguage as Partial<
      Record<SupportedStudyLanguage, Partial<Record<TimePeriodFilterValue, LeaderboardEntry[]>>>
    >

    return byLanguage[selectedLanguage]?.[selectedTimePeriod] || []
  }, [leaderboardData, selectedLanguage, selectedTimePeriod])

  return {
    entries: getEntriesForCurrentView(),
    isLoading,
  }
}
