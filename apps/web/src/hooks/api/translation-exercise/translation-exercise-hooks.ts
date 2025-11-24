import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { useLingui } from '@lingui/react/macro'

export const useTranslationExercise = (id: string | undefined) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.translationExercise.retrieveTranslationExercise.queryOptions({
      input: { exerciseId: id! },
      meta: {
        errorMessage: t`Error fetching translation exercise`,
      },
      queryKey: [QUERY_KEYS.TRANSLATION_EXERCISE, id],
      select: (response) => response.data,
      enabled: !!id,
    })
  )
}

export const useGrammarPatterns = (
  exerciseId: string | undefined,
  motherLanguageSentence: string | undefined,
  studyLanguageSentence: string | undefined,
  studyLanguage: SupportedStudyLanguage,
  motherLanguage: LangCode,
  isLoading: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.translationExercise.generateGrammarPatterns.queryOptions({
      input: {
        motherLanguageSentence: motherLanguageSentence!,
        studyLanguageSentence: studyLanguageSentence!,
        studyLanguage,
        motherLanguage,
      },
      meta: {
        errorMessage: t`Failed to load grammar patterns`,
      },
      queryKey: [
        QUERY_KEYS.TRANSLATION_EXERCISE_GRAMMAR_PATTERNS,
        exerciseId,
        motherLanguageSentence,
        studyLanguageSentence,
        studyLanguage,
        motherLanguage,
      ],
      select: (response) => response.data.grammarPatterns,
      enabled: !isLoading && !!motherLanguageSentence && !!studyLanguageSentence,
    })
  )
}

export const useStartTranslationExercise = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.translationExercise.startTranslationExercise.mutationOptions({
      onSuccess: (response) => {
        // Pre-cache the new exercise data to avoid loading states
        queryClient.setQueryData([QUERY_KEYS.TRANSLATION_EXERCISE, response.data.id], response)
      },
      meta: {
        errorMessage: t`Failed to start translation exercise, please try again.`,
      },
    })
  )
}

export const useCompleteTranslationExercise = (options?: { onSuccess?: () => void }) => {
  const { t } = useLingui()

  return useMutation(
    orpcQuery.translationExercise.completeTranslationExercise.mutationOptions({
      ...options,
      meta: {
        errorMessage: t`Failed to complete translation exercise`,
      },
    })
  )
}
