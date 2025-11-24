import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import {
  AudioSpeedType,
  DEFAULT_WORD_LENGTH,
  UserSettings,
} from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import { orpcClient, orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { OrpcMutationOverrides } from '@/hooks/api/hook-types'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

export const useUpdateAudioSpeedMutation = () => {
  const queryClient = useQueryClient()
  const { defaultedUserData } = useGetUser()
  const { t, i18n } = useLingui()
  const languageName = i18n._(langNameMessages[defaultedUserData.studyLanguage])

  return useMutation<any, Error, { newSpeed: number; audioSpeedType: AudioSpeedType }, { previousUserData: any }>({
    mutationFn: async ({ newSpeed, audioSpeedType }) => {
      const currentSettings = defaultedUserData.settings
      const updatedSettings: UserSettings = {
        ...currentSettings,
        preferences: {
          ...currentSettings.preferences,
          exercises: {
            ...currentSettings.preferences.exercises,
            audioSpeed: {
              ...currentSettings.preferences.exercises.audioSpeed,
              [audioSpeedType]: newSpeed,
            },
          },
        },
      }

      return await orpcClient.userSettings.updateSettings(updatedSettings)
    },
    onMutate: async ({ newSpeed, audioSpeedType }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.USER_DATA] })

      const previousUserData = queryClient.getQueryData([QUERY_KEYS.USER_DATA])

      // Optimistically update the cache
      queryClient.setQueryData([QUERY_KEYS.USER_DATA], (old: any) => {
        if (!old?.data) return old

        return {
          ...old,
          data: {
            ...old.data,
            settings: {
              ...old.data.settings,
              preferences: {
                ...old.data.settings.preferences,
                exercises: {
                  ...old.data.settings.preferences.exercises,
                  audioSpeed: {
                    ...old.data.settings.preferences.exercises.audioSpeed,
                    [audioSpeedType]: newSpeed,
                  },
                },
              },
            },
          },
        }
      })

      return { previousUserData }
    },
    meta: {
      successMessage: t`Settings updated for ${languageName}`,
      errorMessage: t`Failed to update settings`,
    },
  })
}

export const useUpdateSettings = (
  studyLanguage: LangCode,
  options?: OrpcMutationOverrides<typeof orpcQuery.userSettings.updateSettings>
) => {
  const { t, i18n } = useLingui()
  const languageName = i18n._(langNameMessages[studyLanguage])
  return useMutation(
    orpcQuery.userSettings.updateSettings.mutationOptions({
      meta: {
        successMessage: t`Settings updated for ${languageName}`,
        errorMessage: t`Failed to update settings`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export const useFrequencySliderPosition = (studyLanguage: SupportedStudyLanguage): number => {
  const { defaultedUserData } = useGetUser()

  const position = defaultedUserData.settings.preferences.exercises.frequencyList.position.byLanguage.find(
    (lang) => lang.language === studyLanguage
  )?.position

  // We need this type assertion here because TS doesn't detect the defaults in useUser
  return position!
}

export const useFrequencyWordLength = (studyLanguage: SupportedStudyLanguage): number => {
  const { defaultedUserData } = useGetUser()

  const length = defaultedUserData.settings.preferences.exercises.frequencyList.exerciseLength.byLanguage.find(
    (lang) => lang.language === studyLanguage
  )?.length

  return length || DEFAULT_WORD_LENGTH
}

export const useAudioSpeedOfUserPronunciation = (): number => {
  const { defaultedUserData } = useGetUser()
  return defaultedUserData.settings.preferences.exercises.audioSpeed.userPronunciation
}

export const useAudioSpeedOfClonePronunciation = (): number => {
  const { defaultedUserData } = useGetUser()
  return defaultedUserData.settings.preferences.exercises.audioSpeed.clonePronunciation
}
