import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import type { OrpcMutationOverrides } from '@/hooks/api/hook-types'
import { useLingui } from '@lingui/react/macro'

export const useGeneratePronunciationEvaluationExerciseMutation = (
  options?: OrpcMutationOverrides<typeof orpcQuery.pronunciationEvaluationExercise.generatePronunciationExercise>
) => {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.pronunciationEvaluationExercise.generatePronunciationExercise.mutationOptions({
      meta: {
        errorMessage: t`Failed to generate pronunciation exercise.`,
        successMessage: t`Pronunciation exercise generated successfully.`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export const useGenerateCustomPronunciationEvaluationExerciseMutation = (
  options?: OrpcMutationOverrides<typeof orpcQuery.pronunciationEvaluationExercise.generateCustomPronunciationExercise>
) => {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.pronunciationEvaluationExercise.generateCustomPronunciationExercise.mutationOptions({
      meta: {
        errorMessage: t`Failed to generate pronunciation exercise.`,
        successMessage: t`Pronunciation exercise generated successfully.`,
        ...options?.meta,
      },
      ...options,
    })
  )
}

export const useRetrievePronunciationEvaluationExercise = (exerciseId: string | null) => {
  return useQuery(
    orpcQuery.pronunciationEvaluationExercise.retrievePronunciationExercise.queryOptions({
      input: { exerciseId: exerciseId! }, // we know it's not null because of the enabled check
      meta: {
        skipGlobalInvalidation: true,
      },
      queryKey: [QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE, exerciseId],
      enabled: exerciseId !== null,
      select: (response) => response.data,
    })
  )
}

export const useCompletePronunciationExercise = (
  options?: OrpcMutationOverrides<typeof orpcQuery.pronunciationEvaluationExercise.completePronunciationExercise>
) => {
  const { t } = useLingui()
  return useMutation(
    orpcQuery.pronunciationEvaluationExercise.completePronunciationExercise.mutationOptions({
      meta: {
        showSuccessToast: false,
        showErrorToast: false,
        errorMessage: t`Failed to complete pronunciation exercise.`,
        successMessage: t`Pronunciation exercise completed successfully.`,
        ...options?.meta,
      },
      ...options,
    })
  )
}
