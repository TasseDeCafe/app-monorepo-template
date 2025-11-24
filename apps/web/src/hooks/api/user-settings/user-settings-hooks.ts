import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import {
  DEFAULT_AUDIO_SPEED,
  DEFAULT_POSITION_IN_FREQUENCY_LIST,
  DEFAULT_WORD_LENGTH,
} from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import { useSelector } from 'react-redux'
import { selectIsSignedIn } from '@/state/slices/account-slice'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

export const useUpdateAudioSpeedMutation = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.userSettings.updateSettings.mutationOptions({
      onMutate: async (newSettings) => {
        await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.USER_SETTINGS] })

        const previousSettings = queryClient.getQueryData([QUERY_KEYS.USER_SETTINGS])

        queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], {
          data: newSettings,
        })

        return { previousSettings }
      },
      onError: (_, _newSettings, context) => {
        if (context?.previousSettings) {
          queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], context.previousSettings)
        }
      },
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], response)
      },
      meta: {
        errorMessage: t`Failed to update audio speed`,
      },
    })
  )
}

export const useUpdateFrequencyListPositionMutation = (studyLanguage: SupportedStudyLanguage) => {
  const { t, i18n } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.userSettings.updateSettings.mutationOptions({
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], response)
      },
      meta: {
        successMessage: `Frequency list position updated for ${i18n._(langNameMessages[studyLanguage])}`,
        errorMessage: t`Failed to update frequency list position`,
      },
    })
  )
}

export const useUpdateFrequencyWordLengthMutation = (studyLanguage: SupportedStudyLanguage) => {
  const { t, i18n } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.userSettings.updateSettings.mutationOptions({
      onSuccess: (response) => {
        queryClient.setQueryData([QUERY_KEYS.USER_SETTINGS], response)
      },
      meta: {
        errorMessage: t`Failed to update word length`,
        successMessage: `Word length updated for ${i18n._(langNameMessages[studyLanguage])}`,
      },
    })
  )
}

export const useUserSettings = () => {
  const { t } = useLingui()

  const isSignedIn = useSelector(selectIsSignedIn)

  return useQuery({
    ...orpcQuery.userSettings.getSettings.queryOptions({
      meta: {
        errorMessage: t`Failed to fetch user settings`,
      },
      queryKey: [QUERY_KEYS.USER_SETTINGS],
      select: (response) => response.data,
      staleTime: 0,
    }),
    // the demo exercise renders while signed out, so avoid hitting auth-protected endpoints until tokens exist
    enabled: isSignedIn,
  })
}
export const useFrequencySliderPosition = (studyLanguage: SupportedStudyLanguage): number => {
  const { data } = useUserSettings()
  if (!data) {
    return DEFAULT_POSITION_IN_FREQUENCY_LIST
  }

  const position = data.preferences.exercises.frequencyList.position.byLanguage.find(
    (lang) => lang.language === studyLanguage
  )?.position

  return position ?? DEFAULT_POSITION_IN_FREQUENCY_LIST
}
export const useFrequencyWordLength = (studyLanguage: SupportedStudyLanguage): number => {
  const { data } = useUserSettings()
  if (!data) {
    return DEFAULT_WORD_LENGTH
  }

  const length = data.preferences.exercises.frequencyList.exerciseLength.byLanguage.find(
    (lang) => lang.language === studyLanguage
  )?.length

  return length ?? DEFAULT_WORD_LENGTH
}
export const useAudioSpeedOfUserPronunciation = (): number => {
  const { data } = useUserSettings()
  if (!data) {
    return DEFAULT_AUDIO_SPEED
  }

  return data.preferences.exercises.audioSpeed.userPronunciation
}
export const useAudioSpeedOfClonePronunciation = (): number => {
  const { data } = useUserSettings()
  if (!data) {
    return DEFAULT_AUDIO_SPEED
  }

  return data.preferences.exercises.audioSpeed.clonePronunciation
}
