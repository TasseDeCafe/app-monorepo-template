import { useMutation, useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { DEFAULT_DIALECTS, LangCode, SUPPORTED_STUDY_LANGUAGES } from '@template-app/core/constants/lang-codes'
import { OrpcMutationOverrides } from '../hook-types'
import {
  DEFAULT_AUDIO_SPEED,
  DEFAULT_POSITION_IN_FREQUENCY_LIST,
  DEFAULT_WORD_LENGTH,
} from '@template-app/api-client/orpc-contracts/user-settings-contract'
import { NicknameValidationSchema } from '@template-app/api-client/orpc-contracts/user-contract'
import { useLingui } from '@lingui/react/macro'

export function useGetUser() {
  const query = useQuery(
    orpcQuery.user.getUser.queryOptions({
      queryKey: [QUERY_KEYS.USER_DATA],
      select: (response) => response.data,
    })
  )

  const userData = query.data

  const defaultedUserData = {
    motherLanguage: userData?.motherLanguage || LangCode.ENGLISH,
    studyLanguage: userData?.studyLanguage || LangCode.ENGLISH,
    studyDialect: userData?.studyDialect || DEFAULT_DIALECTS[userData?.studyLanguage || LangCode.ENGLISH],
    topics: userData?.topics || [],
    hasVoice: userData?.hasVoice || false,
    referral: userData?.referral || null,
    counters: userData?.counters || [],
    learnedWordsByDay: userData?.learnedWordsByDay || [],
    nickname: userData?.nickname || null,
    dailyStudyMinutes: userData?.dailyStudyMinutes || null,
    settings: {
      preferences: {
        exercises: {
          audioSpeed: {
            clonePronunciation:
              userData?.settings?.preferences?.exercises?.audioSpeed?.clonePronunciation || DEFAULT_AUDIO_SPEED,
            userPronunciation:
              userData?.settings?.preferences?.exercises?.audioSpeed?.userPronunciation || DEFAULT_AUDIO_SPEED,
          },
          frequencyList: {
            exerciseLength: {
              byLanguage:
                userData?.settings?.preferences?.exercises?.frequencyList?.exerciseLength?.byLanguage ||
                SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                  language: lang,
                  length: DEFAULT_WORD_LENGTH,
                })),
            },
            position: {
              byLanguage:
                userData?.settings?.preferences?.exercises?.frequencyList?.position?.byLanguage ||
                SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
                  language: lang,
                  position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
                })),
            },
          },
        },
      },
    },
  }

  return {
    defaultedUserData,
    query,
    userData,
  }
}

export function usePatchMotherLanguage(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchMotherLanguage>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchMotherLanguage.mutationOptions({
      meta: {
        successMessage: t`Native language updated successfully`,
        errorMessage: t`Failed to update native language`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchStudyLanguage(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchStudyLanguage>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchStudyLanguage.mutationOptions({
      meta: {
        successMessage: t`Study language updated successfully`,
        errorMessage: t`Failed to update study language`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchStudyDialect(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchStudyDialect>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchStudyDialect.mutationOptions({
      meta: {
        successMessage: t`Dialect updated successfully`,
        errorMessage: t`Failed to update dialect`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchStudyLanguageAndDialect(
  options?: OrpcMutationOverrides<typeof orpcQuery.user.patchStudyLanguageAndDialect>
) {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.user.patchStudyLanguageAndDialect.mutationOptions({
      meta: {
        successMessage: t`Study language and dialect updated successfully`,
        errorMessage: t`Failed to update study language`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchTopics(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchTopics>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchTopics.mutationOptions({
      meta: {
        successMessage: t`Topics updated successfully`,
        errorMessage: t`Failed to update topics`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchUser(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchUser>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchUser.mutationOptions({
      meta: {
        successMessage: t`User data updated`,
        errorMessage: t`Failed to update user data or clone voice`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function useCheckNicknameAvailability(nickname: string, currentNickname: string | null) {
  const baseOptions = orpcQuery.user.getNicknameAvailability.queryOptions({
    queryKey: [QUERY_KEYS.NICKNAME_AVAILABILITY, nickname, currentNickname],
    input: { nickname },
    select: (response) => response.data,
  })

  return useQuery({
    ...baseOptions,
    enabled: false,
    queryFn: async (context) => {
      if (nickname === currentNickname) {
        return {
          data: {
            isAvailable: true,
            message: 'This is your current nickname',
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

export function usePatchNickname(options?: OrpcMutationOverrides<typeof orpcQuery.user.patchNickname>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchNickname.mutationOptions({
      meta: {
        successMessage: t`Nickname updated successfully`,
        errorMessage: t`Failed to update nickname`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function usePatchDailyStudyMinutes(
  options?: OrpcMutationOverrides<typeof orpcQuery.user.patchDailyStudyMinutes>
) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.patchDailyStudyMinutes.mutationOptions({
      meta: {
        successMessage: t`Daily study time updated successfully`,
        errorMessage: t`Failed to update daily study time`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export function useCreateOrUpdateUser(options?: OrpcMutationOverrides<typeof orpcQuery.user.putUser>) {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.user.putUser.mutationOptions({
      meta: {
        successMessage: t`User setup complete`,
        errorMessage: t`Error setting up user data`,
        ...options?.meta,
      },
      ...options,
    })
  )
}
