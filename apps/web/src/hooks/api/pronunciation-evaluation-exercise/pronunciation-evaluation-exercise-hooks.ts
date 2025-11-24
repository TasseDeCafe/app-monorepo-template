import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DialectCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { Topic } from '@template-app/core/constants/topics'
import { getConfig } from '@/config/environment-config'
import { orpcClient } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export const useGeneratePronunciationEvaluationExerciseMutation = (
  studyLanguage: SupportedStudyLanguage,
  position: number,
  wordLength: number,
  dialect: DialectCode,
  topics: Topic[]
) => {
  const { t } = useLingui()

  return useMutation({
    mutationFn: async () => {
      const response = await orpcClient.pronunciationEvaluationExercise.generatePronunciationExercise({
        language: studyLanguage,
        position,
        wordLength,
        dialect,
        topics: topics.length > 0 ? topics : undefined,
      })
      return response.data
    },
    meta: {
      errorMessage: t`Failed to generate pronunciation exercise, please try again.`,
    },
  })
}

export const usePronunciationEvaluationExercise = (exerciseId: string | undefined) => {
  const { t } = useLingui()

  return useQuery({
    queryKey: [QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE, exerciseId],
    queryFn: async () => {
      const response = await orpcClient.pronunciationEvaluationExercise.retrievePronunciationExercise({
        exerciseId: exerciseId!,
      })
      return response.data
    },
    enabled: !!exerciseId,
    meta: {
      errorMessage: t`Error fetching pronunciation evaluation exercise`,
    },
  })
}

export const useRetrievePronunciationEvaluationExerciseHistory = () => {
  const { t } = useLingui()

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE_HISTORY],
    queryFn: async ({ pageParam }) => {
      const response = await orpcClient.pronunciationEvaluationExercise.retrievePronunciationExerciseHistory({
        cursor: pageParam,
        limit: Number(getConfig().paginationLimit),
      })
      return response.data
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor || null,
    meta: {
      errorMessage: t`Error fetching pronunciation exercise history`,
    },
  })
}

export const useEvaluatePronunciation = (exerciseId: string | undefined) => {
  const { t } = useLingui()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const response = await orpcClient.pronunciationEvaluationExercise.completePronunciationExercise({
        exerciseId: exerciseId!,
        audio: new File([audioBlob], 'user-audio.mp3', { type: audioBlob.type || 'audio/mpeg' }),
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.USER_STATS], {
        data: data.userStats,
      })
    },
    meta: {
      errorMessage: t`Failed to evaluate pronunciation`,
      showErrorToast: false,
    },
  })
}

export const useGenerateCustomPronunciationExercise = (
  expectedText: string,
  studyLanguage: SupportedStudyLanguage,
  dialect: DialectCode
) => {
  const { t } = useLingui()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await orpcClient.pronunciationEvaluationExercise.generateCustomPronunciationExercise({
        text: expectedText.trim(),
        language: studyLanguage,
        dialect,
      })
      return response.data
    },
    onSuccess: (exerciseData) => {
      queryClient.setQueryData([QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE, exerciseData.id], exerciseData)

      exerciseData.wordsFromExerciseThatAreSaved.forEach(({ word, language }) => {
        queryClient.setQueryData([QUERY_KEYS.SAVED_WORDS, word, language], true)
      })
    },
    meta: {
      errorMessage: t`Failed to generate exercise, please try again`,
    },
  })
}
