import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { useLingui } from '@lingui/react/macro'

export const useIsWordSaved = (word: string | null, language: SupportedStudyLanguage) => {
  const queryClient = useQueryClient()

  return useQuery<boolean>({
    queryKey: [QUERY_KEYS.SAVED_WORDS, word, language],
    // This queryFn is a fallback and should not be called if the cache is populated
    // by the getSavedWords query or mutation updates.
    queryFn: async () => false,
    initialData: () => queryClient.getQueryData([QUERY_KEYS.SAVED_WORDS, word, language]) ?? false,
    enabled: !!word,
  })
}

export const useAddSavedWord = (word: string | null, language: SupportedStudyLanguage) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.savedWords.putSavedWord.mutationOptions({
      onMutate: async () => {
        if (!word) return
        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], true)
      },
      onError: () => {
        if (!word) return
        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], false)
      },
      onSettled: (response) => {
        if (response?.data.orthographicForm) {
          queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, response.data.orthographicForm, language], true)
        }
      },
      meta: {
        successMessage: t`Word added to saved words`,
        errorMessage: t`Failed to add word to saved words`,
      },
    })
  )
}

export const useRemoveSavedWord = (word: string | null, language: SupportedStudyLanguage) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.savedWords.deleteSavedWord.mutationOptions({
      onMutate: async () => {
        if (!word) return
        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], false)
      },
      onError: () => {
        if (!word) return
        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], true)
      },
      onSettled: (response) => {
        if (response?.data.orthographicForm) {
          queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, response.data.orthographicForm, language], false)
        }
      },
      meta: {
        successMessage: t`Word removed from saved words`,
        errorMessage: t`Failed to remove word from saved words`,
      },
    })
  )
}
