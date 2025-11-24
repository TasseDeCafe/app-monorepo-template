import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { NicknameValidationSchema } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import { useDispatch } from 'react-redux'
import { accountActions } from '@/state/slices/account-slice'
import type { OrpcMutationOverrides } from '@/hooks/api/hook-types'
import { useLingui } from '@lingui/react/macro'

export const useTopics = () => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.user.getTopics.queryOptions({
      queryKey: [QUERY_KEYS.TOPICS],
      select: (response) => response.data.topics,
      meta: {
        errorMessage: t`Failed to fetch topics`,
      },
    })
  )
}

export const useUserNickname = () => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.user.getNickname.queryOptions({
      queryKey: [QUERY_KEYS.USER_NICKNAME],
      select: (response) => response.data.nickname,
      meta: {
        errorMessage: t`Failed to fetch nickname`,
      },
    })
  )
}

export const useCheckNicknameAvailability = (nickname: string, currentNickname: string | null) => {
  const { t } = useLingui()

  const baseOptions = orpcQuery.user.getNicknameAvailability.queryOptions({
    queryKey: [QUERY_KEYS.NICKNAME_AVAILABILITY, nickname, currentNickname],
    input: { nickname },
    select: (response) => response.data,
    meta: {
      errorMessage: t`Error when checking nickname availability`,
    },
  })

  return useQuery({
    ...baseOptions,
    enabled: false,
    queryFn: async (context) => {
      if (nickname === currentNickname) {
        return {
          data: {
            isAvailable: true,
            message: t`This is your current nickname`,
          },
        }
      }

      const validationResult = NicknameValidationSchema.safeParse(nickname)

      if (!validationResult.success) {
        return {
          data: {
            isAvailable: false,
            message: validationResult.error.issues[0].message,
          },
        }
      }

      return baseOptions.queryFn(context)
    },
  })
}

export const usePatchStudyLanguage = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchStudyLanguage>) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchStudyLanguage.mutationOptions({
      ...options,
      meta: {
        successMessage: t`Study language and dialect updated successfully`,
        errorMessage: t`Failed to update study language`,
        ...options?.meta,
      },
    })
  )
}

export const usePatchStudyDialect = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchStudyDialect>) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchStudyDialect.mutationOptions({
      ...options,
      meta: {
        successMessage: t`Dialect updated successfully`,
        errorMessage: t`Failed to update accent`,
        ...options?.meta,
      },
    })
  )
}

export const usePatchStudyLanguageAndDialect = () => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchStudyLanguageAndDialect.mutationOptions({
      meta: {
        successMessage: t`Study language and dialect updated successfully`,
        errorMessage: t`Failed to update study language`,
      },
    })
  )
}

export const usePatchNickname = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchNickname>) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchNickname.mutationOptions({
      ...options,
      meta: {
        successMessage: t`Nickname updated successfully`,
        errorMessage: t`Failed to update nickname`,
        ...options?.meta,
      },
    })
  )
}

export const useCreateOrUpdateUser = () => {
  const { t } = useLingui()
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return useMutation(
    orpcQuery.user.putUser.mutationOptions({
      onSuccess: (response) => {
        const data = response.data
        queryClient.setQueryData([QUERY_KEYS.USER_WORDS], {
          counters: data.counters,
          learnedWordsByDay: data.learnedWordsByDay,
        })
        // React Query keeps the pre-select value in cache, so any manual write has to preserve that
        // { data: ... } wrapper.
        // So we need to set data in the query cache with the right shape every time.
        // Another approach would be to extract the query key like this in the individual hooks:
        // export const useTopics = () => {
        //   const { queryFn, ...options } = orpcQuery.user.getTopics.queryOptions({
        //     queryKey: [QUERY_KEYS.TOPICS],
        //     meta: {
        //       errorMessage: 'Failed to fetch topics',
        //     },
        //   })
        //
        //   return useQuery({
        //     ...options,
        //     queryFn: async (context) => {
        //       const response = await queryFn(context)
        //       return response.data.topics
        //     },
        //   })
        // }
        //
        // This would allow to do queryClient.setQueryData([QUERY_KEYS.TOPICS], data.topics)
        queryClient.setQueryData([QUERY_KEYS.USER_STATS], {
          data: data.stats,
        })
        queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], {
          data: data.settings,
        })
        queryClient.setQueryData([QUERY_KEYS.USER_NICKNAME], {
          data: {
            nickname: data.nickname,
          },
        })
        queryClient.setQueryData([QUERY_KEYS.TOPICS], {
          data: {
            topics: data.topics,
          },
        })

        const {
          hasVoice,
          referral,
          motherLanguage,
          studyLanguage,
          studyDialect,
          dailyStudyMinutes,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
        } = data

        dispatch(
          accountActions.setBackendUserInfo({
            referral,
            hasVoice: hasVoice,
            motherLanguage: motherLanguage,
            studyLanguage: studyLanguage,
            studyDialect: studyDialect,
            dailyStudyMinutes: dailyStudyMinutes,
            utmSource: utmSource,
            utmMedium: utmMedium,
            utmCampaign: utmCampaign,
            utmTerm: utmTerm,
            utmContent: utmContent,
          })
        )
      },
      meta: {
        successMessage: t`User setup complete`,
        errorMessage: t`Error setting up user data`,
        showErrorModal: true,
      },
    })
  )
}

export const usePatchUser = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchUser>) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchUser.mutationOptions({
      ...options,
      meta: {
        errorMessage: t`Failed to clone voice`,
        ...options?.meta,
      },
    })
  )
}

export const usePatchTopics = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchTopics>) => {
  const { t } = useLingui()
  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.user.patchTopics.mutationOptions({
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.TOPICS], {
          data: {
            topics: response.data.topics,
          },
        })
      },
      ...options,
      meta: {
        successMessage: t`Topics updated successfully`,
        errorMessage: t`Failed to update topics`,
        ...options?.meta,
      },
    })
  )
}

export const usePatchMotherLanguage = (options?: OrpcMutationOverrides<typeof orpcQuery.user.patchMotherLanguage>) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchMotherLanguage.mutationOptions({
      ...options,
      meta: {
        successMessage: t`Mother language updated successfully`,
        errorMessage: t`Failed to update mother language`,
        ...options?.meta,
      },
    })
  )
}

export const usePatchDailyStudyMinutes = (
  options?: OrpcMutationOverrides<typeof orpcQuery.user.patchDailyStudyMinutes>
) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchDailyStudyMinutes.mutationOptions({
      ...options,
      meta: {
        successMessage: t`Daily study time updated successfully`,
        errorMessage: t`Failed to update daily study time`,
        ...options?.meta,
      },
    })
  )
}

const useUserStats = () => {
  const { t } = useLingui()

  const { data: userStats } = useQuery(
    orpcQuery.user.getUserStats.queryOptions({
      queryKey: [QUERY_KEYS.USER_STATS],
      select: (response) => response.data,
      meta: {
        errorMessage: t`Failed to fetch user stats`,
      },
    })
  )
  return userStats
}

export const useCurrentStreakFromXp = (): number => {
  const userStats = useUserStats()
  return userStats?.currentStreak ?? 0
}

export const useTotalDaysLearnedFromXp = (): number => {
  const userStats = useUserStats()
  return userStats?.totalDaysLearned ?? 0
}

export const useLongestStreakFromXp = (): number => {
  const userStats = useUserStats()
  return userStats?.longestStreak ?? 0
}

export const useNumberOfAchievedStreakBadgesFromXp = (): number => {
  const userStats = useUserStats()
  return userStats?.numberOfAchievedStreakBadges ?? 0
}

export const useGetNumberOfDaysOfNextStreakBadgeFromXp = (): number => {
  const userStats = useUserStats()
  return userStats?.numberOfDaysOfNextStreakBadge ?? 0
}

export const useTotalXp = (): number => {
  const userStats = useUserStats()
  return userStats?.totalXp ?? 0
}
