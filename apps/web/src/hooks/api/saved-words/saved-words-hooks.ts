import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { getConfig } from '@/config/environment-config'
import { useLingui } from '@lingui/react/macro'

type SavedWordMutationInput =
  | {
      language: SupportedStudyLanguage
      contextWords: string[]
      wordIndex: number
    }
  | {
      language: SupportedStudyLanguage
      orthographicForm: string
    }

const getWordFromInput = (input: SavedWordMutationInput): string | null => {
  if ('orthographicForm' in input) {
    return input.orthographicForm
  }

  if (
    'wordIndex' in input &&
    'contextWords' in input &&
    input.wordIndex >= 0 &&
    input.contextWords?.[input.wordIndex]
  ) {
    return input.contextWords[input.wordIndex]
  }

  return null
}

export const useIsWordSaved = (word: string | null, language: SupportedStudyLanguage) => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [QUERY_KEYS.SAVED_WORDS, word, language],
    // This queryFn is a fallback and should not be called if the cache is populated
    // by the getSavedWords query or mutation updates.
    queryFn: async () => false,
    initialData: () => queryClient.getQueryData([QUERY_KEYS.SAVED_WORDS, word, language]) ?? false,
    enabled: !!word,
  })
}

export const useAddSavedWord = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.savedWords.putSavedWord.mutationOptions({
      onMutate: async (variables) => {
        const word = getWordFromInput(variables)

        if (!word) return

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, variables.language], true)
      },
      onError: (_error, variables) => {
        const word = getWordFromInput(variables)
        if (!word) return

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, variables.language], false)
      },
      onSettled: (response, _error, variables) => {
        const language = variables?.language
        const responseWord = response?.data.orthographicForm ?? null
        const fallbackWord = variables ? getWordFromInput(variables) : null
        const targetWord = responseWord ?? fallbackWord

        if (!language || !targetWord) {
          return
        }

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, targetWord, language], true)
      },
      meta: {
        successMessage: t`Word added to saved words`,
        errorMessage: t`Failed to add word to saved words`,
      },
    })
  )
}

const savedWordsInitialCursor: string | undefined = undefined

const getSavedWordsInput = (language: SupportedStudyLanguage | undefined) => (pageParam: string | undefined) => ({
  cursor: pageParam,
  limit: Number(getConfig().paginationLimit),
  language,
})

export const getSavedWordsInfiniteKey = (language: SupportedStudyLanguage | undefined) =>
  orpcQuery.savedWords.getSavedWords.infiniteKey({
    input: getSavedWordsInput(language),
    initialPageParam: savedWordsInitialCursor,
  })

export const useRemoveSavedWord = () => {
  const { t } = useLingui()

  const queryClient = useQueryClient()

  return useMutation(
    orpcQuery.savedWords.deleteSavedWord.mutationOptions({
      onMutate: async (variables) => {
        const word = getWordFromInput(variables)

        if (!word) return

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, variables.language], false)
      },
      onError: (_error, variables) => {
        const word = getWordFromInput(variables)
        if (!word) return

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, variables.language], true)
      },
      onSettled: (response, _error, variables) => {
        const language = variables?.language
        const responseWord = response?.data.orthographicForm ?? null
        const fallbackWord = variables ? getWordFromInput(variables) : null
        const targetWord = responseWord ?? fallbackWord

        if (!language || !targetWord) {
          return
        }

        queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, targetWord, language], false)
        Promise.all([
          queryClient.invalidateQueries({ queryKey: getSavedWordsInfiniteKey(language) }),
          queryClient.invalidateQueries({ queryKey: getSavedWordsInfiniteKey(undefined) }),
        ]).catch(() => {})
      },
      meta: {
        successMessage: t`Word removed from saved words`,
        errorMessage: t`Failed to remove word from saved words`,
      },
    })
  )
}

export const useSavedWordsInfiniteQuery = (language: SupportedStudyLanguage | undefined) => {
  const { t } = useLingui()

  return useInfiniteQuery(
    orpcQuery.savedWords.getSavedWords.infiniteOptions({
      input: getSavedWordsInput(language),
      initialPageParam: savedWordsInitialCursor,
      getNextPageParam: (lastPage) => lastPage.data?.nextCursor ?? undefined,
      meta: {
        errorMessage: t`Error when retrieving words`,
      },
      refetchOnWindowFocus: 'always',
      refetchOnMount: 'always',
    })
  )
}

export type SavedWordsInfiniteQueryData = ReturnType<typeof useSavedWordsInfiniteQuery>['data']
