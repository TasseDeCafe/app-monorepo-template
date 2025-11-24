import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLoadMoreOnDocumentScroll } from '@/hooks/use-load-more-on-document-scroll.tsx'
import { useLocation } from 'react-router-dom'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { SquaresLoader } from '@/components/loader/squares-loader'
import { SavedWordsTable } from './saved-words-table.tsx'
import { LanguageFilter, LanguageFilterValue } from '../learned-words/language-filter.tsx'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { getSavedWordsInfiniteKey, useSavedWordsInfiniteQuery } from '@/hooks/api/saved-words/saved-words-hooks'

export const SavedWordsSubTab = () => {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [languageFilter, setLanguageFilter] = useState<LanguageFilterValue>(undefined)

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isPending, refetch } =
    useSavedWordsInfiniteQuery(languageFilter)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { resetLoading } = useLoadMoreOnDocumentScroll({
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage().then(() => {})
      }
    },
    hasMore: hasNextPage,
  })

  useEffect(() => {
    const refetchData = async () => {
      await queryClient.resetQueries({ queryKey: getSavedWordsInfiniteKey(languageFilter) })
      await refetch()
    }
    refetchData()
  }, [location.pathname, queryClient, refetch])

  useEffect(() => {
    refetch().then()
  }, [languageFilter, refetch])

  useEffect(() => {
    if (!isFetchingNextPage) {
      resetLoading()
    }
  }, [isFetchingNextPage, resetLoading])

  const handleLanguageChange = (value: LanguageFilterValue) => {
    setLanguageFilter(value)
  }

  if (isPending) {
    return (
      <div className='mt-8 flex w-full justify-center'>
        <SquaresLoader />
      </div>
    )
  }

  return (
    <div className='flex h-full w-full flex-col items-center py-4'>
      {data && (
        <div className='flex h-full w-full flex-col items-center justify-between gap-y-8 p-1 md:gap-y-32 md:p-2'>
          <div className='flex w-full flex-col gap-y-4 pb-4 md:max-w-4xl lg:max-w-6xl'>
            <div className='w-full lg:w-1/4'>
              <LanguageFilter
                onLanguageSelect={handleLanguageChange}
                langCodes={[undefined, ...SUPPORTED_STUDY_LANGUAGES]}
                defaultValue={undefined}
              />
            </div>
            <SavedWordsTable data={data} languageFilter={languageFilter} />
            {isFetching && (
              <div className='flex h-full w-full justify-center'>
                <SquaresLoader />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
