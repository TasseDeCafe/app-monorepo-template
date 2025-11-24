import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { useCallback, useMemo } from 'react'
import { getConfig } from '@/config/environment-config'
import { LanguageFilterValue } from '@/components/progress/tabs/stats-tab/stats-subtabs/learned-words/language-filter'
import { UserWordsData, WordsInLanguageCounter } from '@yourbestaccent/api-client/orpc-contracts/words-contract'
import { useLingui } from '@lingui/react/macro'

export const useGetLearnedWords = (languageFilter: LanguageFilterValue) => {
  const { t } = useLingui()

  const getLearnedWordsInput = useCallback(
    (pageParam?: string) => ({
      cursor: pageParam,
      limit: Number(getConfig().paginationLimit),
      language: languageFilter,
    }),
    [languageFilter]
  )

  return useInfiniteQuery(
    orpcQuery.words.getLearnedWords.infiniteOptions({
      input: getLearnedWordsInput,
      queryKey: [QUERY_KEYS.GET_LEARNED_WORDS, languageFilter],
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
      refetchOnWindowFocus: 'always',
      refetchOnMount: 'always',
      select: (data) => ({
        ...data,
        pages: data.pages.map((page) => page.data),
      }),
      meta: {
        errorMessage: t`Error when retrieving words`,
      },
    })
  )
}

export const __calculateNumberOfLearnedWords = (data: UserWordsData | undefined): number => {
  if (!data) {
    return 0
  }
  return data.counters.reduce((acc, counter) => acc + counter.wordsPronouncedCorrectlyCount, 0)
}

export const __getWordsPronouncedCorrectlyCounters = (data: UserWordsData | undefined): WordsInLanguageCounter[] => {
  if (!data) {
    return []
  }
  return data.counters.filter((counter) => counter.wordsPronouncedCorrectlyCount > 0)
}

export const __calculateLanguagesLearned = (data: UserWordsData | undefined): number => {
  if (!data) {
    return 0
  }
  return data.counters.filter((counter: WordsInLanguageCounter) => counter.wordsPronouncedCorrectlyCount > 0).length
}

const useUserWordsData = () => {
  return useQuery(
    orpcQuery.user.getUser.queryOptions({
      select: (response): UserWordsData => ({
        counters: response.data.counters,
        learnedWordsByDay: response.data.learnedWordsByDay,
      }),
      queryKey: [QUERY_KEYS.USER_WORDS],
    })
  )
}

export const useGetNumberOfLanguagesLearned = (): number => {
  const { data } = useUserWordsData()
  return useMemo(() => __calculateLanguagesLearned(data), [data])
}

export const useNumberOfLearnedWords = (): number => {
  const { data } = useUserWordsData()
  return useMemo(() => __calculateNumberOfLearnedWords(data), [data])
}

export const useGetWordsPronouncedCorrectlyCounters = (): WordsInLanguageCounter[] => {
  const { data } = useUserWordsData()
  return useMemo(() => __getWordsPronouncedCorrectlyCounters(data), [data])
}
